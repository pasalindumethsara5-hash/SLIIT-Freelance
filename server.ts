import 'dotenv/config';
import { GoogleGenAI, type Content } from '@google/genai';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLocalCampusAnswer } from './src/utils/campusAiEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// --- Security Helpers ---
const SLIIT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/i;
const SLIIT_ID_REGEX = /^(IT|BM|EN|HS|AR|GS)[0-9]{8}$/i;

function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

interface RateBucket {
  timestamps: number[];
}
const rateBuckets = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'local';
  const now = Date.now();
  const bucket = rateBuckets.get(clientIp) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_WINDOW_MS);

  if (bucket.timestamps.length >= RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({
      error: 'Too many requests from this client. Please wait a minute before retrying.',
    });
    return;
  }

  bucket.timestamps.push(now);
  rateBuckets.set(clientIp, bucket);
  next();
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createServer() {
  const app = express();
  app.disable('x-powered-by');

  // Strict Security Headers Middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      platform: 'SLIIT Freelance Hub',
      commissionRate: 0.25,
      securityHardened: true,
    });
  });

  // Server-side SLIIT Campus Identity Check
  app.post('/api/security/verify-campus', apiRateLimiter, (req: Request, res: Response) => {
    const email = sanitizeText(req.body?.email, 100).toLowerCase();
    const studentId = sanitizeText(req.body?.studentId, 16).toUpperCase();

    if (!SLIIT_EMAIL_REGEX.test(email)) {
      res.status(400).json({
        valid: false,
        error: 'Access denied: Only @my.sliit.lk or @sliit.lk student emails are permitted.',
      });
      return;
    }

    if (!SLIIT_ID_REGEX.test(studentId)) {
      res.status(400).json({
        valid: false,
        error: 'Invalid SLIIT registration ID. Expected IT/BM/EN/HS/AR/GS followed by 8 digits.',
      });
      return;
    }

    res.json({
      valid: true,
      normalizedEmail: email,
      normalizedStudentId: studentId,
      verifiedAt: new Date().toISOString(),
    });
  });

  // Server-side Gemini AI Campus Assistant with Resilient Fallback Engine
  app.post('/api/chat', apiRateLimiter, async (req: Request, res: Response) => {
    const message = sanitizeText(req.body?.message, 1500);
    if (!message) {
      res.status(400).json({ error: 'Please enter a message for SLIIT Campus AI.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Use intelligent local campus engine if Gemini API key is not configured
      const localReply = generateLocalCampusAnswer(message);
      res.json({ reply: localReply, source: 'campus-engine' });
      return;
    }

    const rawHistory = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
    const contents: Content[] = [];
    for (const item of rawHistory) {
      if (item && (item.role === 'user' || item.role === 'model')) {
        const cleanText = sanitizeText(item.text, 1200);
        if (cleanText) {
          contents.push({
            role: item.role,
            parts: [{ text: cleanText }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const contextSummary = sanitizeText(req.body?.campusContext, 1200);

    const systemInstruction = [
      'You are SLIIT Hub AI Bot, a friendly, intelligent campus assistant robot built for SLIIT Freelance Hub.',
      'Help SLIIT students across Malabe, Metro, Kandy, Matara, Kurunegala, and Jaffna with:',
      '1) Any questions about SLIIT academics, modules (DSA, OOP, ITP, MAD, SE, DBMS, Maths), and student life.',
      '2) Finding or pricing freelance gigs (Paid gigs use 25% platform commission and 75% seller payout; Free Peer Help services are LKR 0 with 0% fee).',
      '3) Recommending or outlining Kuppi revision classes and Study Together sessions.',
      '4) Coding, debugging, software architecture, and academic guidelines.',
      '5) Explaining SLIIT-only security (@my.sliit.lk verification, escrowed order release).',
      'Keep answers concise, practical, and friendly. Always respond in clear, professional English.',
      contextSummary ? `Live Hub Context: ${contextSummary}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastErr: unknown = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction },
        });
        const reply = response.text?.trim();
        if (reply) {
          res.json({ reply, model, source: 'gemini' });
          return;
        }
        lastErr = new Error('The AI model returned an empty response.');
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('500') || msg.includes('404');
        if (isTransient && i < modelsToTry.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          continue;
        }
        break;
      }
    }

    // Graceful fallback: If Gemini upstream fails or is rate-limited, provide intelligent local answer
    console.warn('Gemini request failed, serving local campus knowledge fallback:', lastErr);
    const fallbackReply = generateLocalCampusAnswer(message);
    res.json({ reply: fallbackReply, source: 'campus-fallback' });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SLIIT Freelance Hub server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start SLIIT Freelance Hub server:', err);
  process.exit(1);
});
