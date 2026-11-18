import { Bot, RotateCcw, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import type { UserProfile } from '../types/marketplace';
import { generateLocalCampusAnswer } from '../utils/campusAiEngine';
import { sanitizeTextInput } from '../utils/campusRules';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface CampusAiViewProps {
  currentUser: UserProfile | null;
  gigsCount: number;
  freeGigsCount: number;
  kuppiCount: number;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'model',
  text: 'Hello! I am SLIIT Hub AI. Ask me about finding paid or free student services, joining Kuppi & Study Together groups, calculating the 25% / 75% payout split, or drafting a high-converting campus gig.',
};

const STARTER_PROMPTS = [
  'Which Free Peer Help & Kuppi sessions are available right now?',
  'If I sell a SLIIT gig for LKR 12,000, how does the 25% fee work?',
  'Write a clean gig title and 4 deliverables for a React + Spring Boot project.',
  'How does SLIIT Freelance Hub keep accounts and orders secure?',
];

export function CampusAiView({ currentUser, gigsCount, freeGigsCount, kuppiCount }: CampusAiViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (rawText: string) => {
    const clean = sanitizeTextInput(rawText, 1500);
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    const campusContext = `Active gigs: ${gigsCount} (${freeGigsCount} free peer help), Active Kuppi/Study sessions: ${kuppiCount}, Signed-in student: ${
      currentUser ? `${currentUser.displayName} (${currentUser.campus})` : 'Guest'
    }`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          campusContext,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      let replyText = payload.reply;
      if (!res.ok || !replyText) {
        replyText = generateLocalCampusAnswer(clean, {
          currentUser,
          gigsCount,
          freeGigsCount,
          kuppiCount,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: replyText as string,
        },
      ]);
    } catch {
      const fallback = generateLocalCampusAnswer(clean, {
        currentUser,
        gigsCount,
        freeGigsCount,
        kuppiCount,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallback,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Dedicated SLIIT Campus Assistant
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#0B1F3A]">SLIIT Hub AI Chatbot</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Ask about gig pricing, Kuppi study guidance, deliverables, or campus security rules.
          </p>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setMessages([INITIAL_MESSAGE]);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 border border-white hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        )}
      </div>

      {/* Starter Prompt Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STARTER_PROMPTS.map((prompt) => (
          <motion.button
            key={prompt}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            disabled={loading}
            onClick={() => void sendMessage(prompt)}
            className="text-left px-4 py-3 text-xs font-medium text-slate-700 glass-card hover:bg-white rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </motion.button>
        ))}
      </div>

      {/* Chat Conversation Window */}
      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col">
        <div
          data-testid="ai-messages"
          className="p-5 sm:p-6 space-y-4 max-h-[460px] min-h-[300px] overflow-y-auto"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'bg-white/85 border border-white text-slate-800 shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-[#0B1F3A]/85 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <span className="glass-subtle px-4 py-2.5 rounded-2xl">SLIIT Hub AI is thinking...</span>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            data-testid="ai-error"
            className="mx-5 mb-3 p-3 bg-red-50/95 border border-red-200 rounded-xl text-xs font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-900/10 bg-white/45 flex items-center gap-3">
          <label htmlFor="campus-ai-input" className="sr-only">
            Ask SLIIT Hub AI
          </label>
          <input
            id="campus-ai-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SLIIT gigs, Free Help, Kuppi sessions, or 25% payout..."
            className="flex-1 px-4 py-3 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
