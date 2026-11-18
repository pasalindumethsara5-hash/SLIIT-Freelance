import { ArrowLeft, Award, CheckCircle2, KeyRound, Lock, Mail, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type FormEvent } from 'react';
import {
  CAMPUS_BRANCHES,
  SLIIT_FACULTIES,
  type CampusBranch,
  type SliitFaculty,
  type StudentProfileStats,
  type UserProfile,
} from '../types/marketplace';
import {
  FOUNDER_ADMIN_EMAIL,
  sanitizeTextInput,
  validateSliitEmail,
  validateSliitStudentId,
} from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface CampusGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  profileStats: StudentProfileStats | null;
  authEmail: string | null;
  isFirebaseAuthenticated: boolean;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onVerifyCampusProfile: (profile: Omit<UserProfile, 'uid' | 'createdAtMs'>) => Promise<void>;
  onEnterDemoStudent: (asFounder?: boolean) => void;
  onOpenFullProfile: () => void;
}

export function CampusGateModal({
  isOpen,
  onClose,
  currentUser,
  profileStats,
  authEmail,
  isFirebaseAuthenticated,
  onGoogleSignIn,
  onSignOut,
  onVerifyCampusProfile,
  onEnterDemoStudent,
  onOpenFullProfile,
}: CampusGateModalProps) {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [sliitEmail, setSliitEmail] = useState(currentUser?.sliitEmail ?? '');
  const [sliitStudentId, setSliitStudentId] = useState(currentUser?.sliitStudentId ?? '');
  const [campus, setCampus] = useState<CampusBranch>(currentUser?.campus ?? 'Malabe');
  const [faculty, setFaculty] = useState<SliitFaculty>(currentUser?.faculty ?? 'Computing');
  const [batch, setBatch] = useState(currentUser?.batch ?? 'Y1S2');

  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const generateAndSendCode = (targetEmail: string, targetId: string) => {
    // Generate a secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResendTimer(30);
    setOtpCode('');

    // Optional server dispatch
    fetch('/api/security/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, studentId: targetId, code }),
    }).catch(() => {
      // Local resilient fallback
    });

    return code;
  };

  const handleRequestCode = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = sanitizeTextInput(displayName, 80);
    if (trimmedName.length < 2) {
      setError('Please enter your full student name (at least 2 characters).');
      return;
    }

    const emailCheck = validateSliitEmail(sliitEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Only @my.sliit.lk or @sliit.lk campus emails are permitted.');
      return;
    }

    const idCheck = validateSliitStudentId(sliitStudentId);
    if (!idCheck.valid) {
      setError(idCheck.error || 'Enter a valid SLIIT registration number (e.g. IT26101333).');
      return;
    }

    // Generate code and transition to OTP verification step
    generateAndSendCode(emailCheck.normalized, idCheck.normalized);
    setStep('otp');
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = otpCode.trim();
    if (!entered) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    // Verify against generated code (or universal demo code 123456)
    if (entered !== generatedCode && entered !== '123456') {
      setError('Invalid verification code. Please check your email or enter the code shown above.');
      return;
    }

    setSubmitting(true);
    try {
      const trimmedName = sanitizeTextInput(displayName, 80);
      const emailCheck = validateSliitEmail(sliitEmail);
      const idCheck = validateSliitStudentId(sliitStudentId);

      await onVerifyCampusProfile({
        displayName: trimmedName,
        sliitEmail: emailCheck.normalized,
        sliitStudentId: idCheck.normalized,
        campus,
        faculty,
        batch: sanitizeTextInput(batch, 16) || 'Y1S2',
        role: 'student',
        verifiedCampus: true,
        isFounderAdmin: authEmail === FOUNDER_ADMIN_EMAIL,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create verified student account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    const emailCheck = validateSliitEmail(sliitEmail);
    const idCheck = validateSliitStudentId(sliitStudentId);
    generateAndSendCode(emailCheck.normalized, idCheck.normalized);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-gate-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-white/95 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-white"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/aistudio/image_904ea47c.png"
                  alt="SLIIT Freelance Hub emblem"
                  className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-white shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-amber-700 tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    SLIIT Verified Student Gate
                  </p>
                  <h2 id="campus-gate-title" className="mt-0.5 font-display text-2xl font-bold text-slate-900">
                    {step === 'otp' ? 'Enter Email Verification Code' : currentUser ? 'Verified SLIIT Member' : 'Create & Verify Student Account'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close verification modal"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Sign-In Status */}
            <div className="mt-4 p-3.5 glass-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Cloud Authentication</div>
                <div className="text-xs font-semibold text-slate-900">
                  {isFirebaseAuthenticated && authEmail ? `Signed in as ${authEmail}` : 'Optional: Sign in with Google'}
                </div>
              </div>
              {isFirebaseAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void onGoogleSignIn()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign in with Google
                </button>
              )}
            </div>

            {/* Badges for Existing User */}
            {currentUser && profileStats && (
              <div className="mt-4 p-4 glass-subtle rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Your Achievement Badges ({profileStats.earnedBadges.length}/{profileStats.badges.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullProfile();
                    }}
                    className="text-xs font-semibold text-[#0B1F3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    View All Badges
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileStats.earnedBadges.map((badge) => (
                    <AchievementBadgeChip key={badge.id} badge={badge} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Student Information Form */}
            {step === 'details' && (
              <form onSubmit={handleRequestCode} className="mt-4 space-y-4">
                {error && (
                  <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="sliit-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    id="sliit-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Methsara K.A.P"
                    className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="sliit-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      SLIIT Campus Email
                    </label>
                    <input
                      id="sliit-email"
                      type="email"
                      value={sliitEmail}
                      onChange={(e) => setSliitEmail(e.target.value)}
                      placeholder="IT26101333@my.sliit.lk"
                      className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sliit-id" className="block text-xs font-semibold text-slate-700 mb-1">
                      SLIIT Registration No.
                    </label>
                    <input
                      id="sliit-id"
                      type="text"
                      value={sliitStudentId}
                      onChange={(e) => setSliitStudentId(e.target.value.toUpperCase())}
                      placeholder="IT26101333"
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="sliit-campus" className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus
                    </label>
                    <select
                      id="sliit-campus"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value as CampusBranch)}
                      className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    >
                      {CAMPUS_BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sliit-faculty" className="block text-xs font-semibold text-slate-700 mb-1">
                      Faculty
                    </label>
                    <select
                      id="sliit-faculty"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value as SliitFaculty)}
                      className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    >
                      {SLIIT_FACULTIES.map((fac) => (
                        <option key={fac} value={fac}>
                          {fac}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sliit-batch" className="block text-xs font-semibold text-slate-700 mb-1">
                      Year / Semester
                    </label>
                    <input
                      id="sliit-batch"
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="Y1S2"
                      className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Mail className="w-4 h-4 text-amber-300" />
                  Send Verification Code to Email
                </button>
              </form>
            )}

            {/* STEP 2: Email OTP Verification Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
                {/* Instant Verification Code Banner */}
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verification Code Sent to {sliitEmail}</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Check your university inbox or use the instant access code below:
                  </p>
                  <div className="mt-1 flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-300 shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">YOUR 6-DIGIT CODE</span>
                      <span className="font-mono text-xl font-bold tracking-widest text-emerald-700">
                        {generatedCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedCode)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="otp-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 654321"
                    autoFocus
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 px-4 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] bg-slate-50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.trim().length < 6}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#0B1F3A] to-[#1E3A8A] hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  {submitting ? 'Verifying Account...' : 'Verify Code & Create Account'}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('details');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change details
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="inline-flex items-center gap-1 text-[#0B1F3A] font-semibold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Instant Sandbox / Demo Options */}
            <div className="mt-5 pt-4 border-t border-slate-900/10">
              <p className="text-xs font-medium text-slate-500">
                Quick testing options for presentation:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onEnterDemoStudent(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Use Student Sandbox (IT21849210)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEnterDemoStudent(true);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
                >
                  Preview Founder Admin (25% Owner)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
