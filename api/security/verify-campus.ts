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

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const email = sanitizeText(req.body?.email, 100).toLowerCase();
  const studentId = sanitizeText(req.body?.studentId, 16).toUpperCase();

  if (!SLIIT_EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      valid: false,
      error: 'Access denied: Only @my.sliit.lk or @sliit.lk student emails are permitted.',
    });
  }

  if (!SLIIT_ID_REGEX.test(studentId)) {
    return res.status(400).json({
      valid: false,
      error: 'Invalid SLIIT registration ID. Expected IT/BM/EN/HS/AR/GS followed by 8 digits.',
    });
  }

  return res.status(200).json({
    valid: true,
    normalizedEmail: email,
    normalizedStudentId: studentId,
    verifiedAt: new Date().toISOString(),
  });
}
