import { Bot, Copy, Check, MessageSquare, Minimize2, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { UserProfile } from '../types/marketplace';
import { generateLocalCampusAnswer } from '../utils/campusAiEngine';
import { sanitizeTextInput } from '../utils/campusRules';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface CampusBotWidgetProps {
  currentUser: UserProfile | null;
  gigsCount: number;
  freeGigsCount: number;
  kuppiCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'bot-welcome',
  role: 'model',
  text: 'Hello! 👋 I am your **SLIIT Campus AI Bot** 🤖.\n\nAsk me anything about:\n- 🎓 Finding or hosting **Kuppi & Study** sessions\n- 💰 Calculating the **25% platform fee & 75% seller payout**\n- 🚀 Publishing high-converting **freelance services & deliverables**\n- 💻 Technical guidance & modules (DSA, OOP, ITP, MAD, React, Spring Boot)\n- 🏛️ SLIIT campus locations, security & student verification',
  timestamp: 'Just now',
};

const SUGGESTED_QUESTIONS = [
  'Which Kuppi sessions are active?',
  'How does the 25% fee & 75% payout work?',
  'How to post a high-converting gig?',
  'Explain DSA & OOP study help for SLIIT',
  'How is campus email verification secured?',
];

export function CampusBotWidget({
  currentUser,
  gigsCount,
  freeGigsCount,
  kuppiCount,
  isOpen,
  onToggle,
  onClose,
}: CampusBotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (rawText: string) => {
    const clean = sanitizeTextInput(rawText, 1500);
    if (!clean || loading) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
      timestamp: timeStr,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    const campusContext = `Active gigs: ${gigsCount} (${freeGigsCount} free peer help), Active Kuppi sessions: ${kuppiCount}, Signed-in student: ${
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
        // Fallback to local intelligent campus engine
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Local fallback on network failure
      const localReply = generateLocalCampusAnswer(clean, {
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
          text: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble / Tooltip above button */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 mr-1 relative bg-[#0B1F3A] text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-white/20 max-w-[260px]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="cursor-pointer" onClick={onToggle}>
              👋 **Campus AI Bot** is online! Ask anything here.
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0B1F3A] rotate-45 border-r border-b border-white/20"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-6rem)] mb-3 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B1F3A] via-[#122B4D] to-[#1E3A8A] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0B1F3A]"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-sm tracking-tight text-white">SLIIT Campus AI Bot</h3>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Ask any question · Academic &amp; Hub AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="Minimize"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(q)}
                  className="text-[11px] font-medium text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200/80 hover:border-amber-300 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[88%]">
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-[#0B1F3A] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/70 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-600 transition-colors inline-flex items-center gap-0.5 ml-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-7 h-7 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200/80 px-3 py-2 rounded-2xl rounded-tl-none shadow-2xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-[11px] text-slate-500 font-medium">Campus Bot is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything (e.g. Kuppi, 25% fee, Java, Gigs)..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0B1F3A] hover:bg-slate-800 text-white disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Vanguard Copyright Subtext */}
            <div className="py-1.5 px-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center tracking-tight select-none">
              © 2026 The team Vanguard. All Rights Reserved.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Floating Robot Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        aria-label="Open SLIIT Campus Bot"
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 border-2 ${
          isOpen
            ? 'bg-slate-800 border-white/60 text-white shadow-slate-900/40 rotate-90'
            : 'bg-gradient-to-tr from-[#0B1F3A] via-[#1E3A8A] to-blue-600 border-white text-white shadow-blue-900/40'
        }`}
      >
        {/* Glow & Pulse Animation Rings */}
        {!isOpen && (
          <>
            <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping -z-10 opacity-75"></span>
            <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-sm -z-10"></span>
          </>
        )}

        {/* Live Green Status Dot */}
        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>

        {/* Icon */}
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm transition-transform group-hover:scale-110" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
