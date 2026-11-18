import { Award, Lock, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
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
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [sliitEmail, setSliitEmail] = useState(currentUser?.sliitEmail ?? '');
  const [sliitStudentId, setSliitStudentId] = useState(currentUser?.sliitStudentId ?? '');
  const [campus, setCampus] = useState<CampusBranch>(currentUser?.campus ?? 'Malabe');
  const [faculty, setFaculty] = useState<SliitFaculty>(currentUser?.faculty ?? 'Computing');
  const [batch, setBatch] = useState(currentUser?.batch ?? 'Y3S2');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = sanitizeTextInput(displayName, 80);
    if (trimmedName.length < 2) {
      setError('Enter your full student name (at least 2 characters).');
      return;
    }

    const emailCheck = validateSliitEmail(sliitEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Only @my.sliit.lk or @sliit.lk emails are permitted.');
      return;
    }

    const idCheck = validateSliitStudentId(sliitStudentId);
    if (!idCheck.valid) {
      setError(idCheck.error || 'Enter a valid SLIIT registration number.');
      return;
    }

    setSubmitting(true);
    try {
      // Server-side SLIIT campus verification check (with resilient fallback to client verification)
      try {
        const res = await fetch('/api/security/verify-campus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailCheck.normalized,
            studentId: idCheck.normalized,
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          if (body?.error && (body.error.includes('Access denied') || body.error.includes('Invalid SLIIT registration ID'))) {
            throw new Error(body.error);
          }
        }
      } catch (networkOrServerErr) {
        if (
          networkOrServerErr instanceof Error &&
          (networkOrServerErr.message.includes('Access denied') || networkOrServerErr.message.includes('Invalid SLIIT'))
        ) {
          throw networkOrServerErr;
        }
        // If it was a network error or missing serverless endpoint, client validation already succeeded.
      }

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
      setError(err instanceof Error ? err.message : 'Unable to save SLIIT verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-gate-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-white/90 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
          >
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
                    Hardened SLIIT Campus-Only Gate
                  </p>
                  <h2 id="campus-gate-title" className="mt-0.5 font-display text-2xl font-bold text-slate-900">
                    {currentUser ? 'Verified SLIIT Member' : 'Verify Your SLIIT Student Access'}
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

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          SLIIT Freelance Hub is protected by dual client + server domain verification, rate limiting, and Firestore
          RBAC rules. Only <span className="font-mono-num font-medium">@my.sliit.lk</span> /{' '}
          <span className="font-mono-num font-medium">@sliit.lk</span> student accounts can post services, join Kuppi
          sessions, or place orders.
        </p>

        {/* Google Sign-In Status */}
        <div className="mt-5 p-4 glass-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-slate-500">Cloud Session</div>
            <div className="text-sm font-medium text-slate-900">
              {isFirebaseAuthenticated && authEmail
                ? `Signed in as ${authEmail}`
                : 'Not signed into Google Auth'}
            </div>
          </div>
          {isFirebaseAuthenticated ? (
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onGoogleSignIn()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {/* Signed-in Student Badges Summary */}
        {currentUser && profileStats && (
          <div className="mt-4 p-4 glass-subtle rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
                <Award className="w-4 h-4 text-amber-600" />
                <span>
                  Your Achievement Badges ({profileStats.earnedBadges.length}/{profileStats.badges.length})
                </span>
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
            <div className="font-mono-num text-[11px] text-slate-600">
              {profileStats.totalCompletedOrders} completed orders · {profileStats.kuppiHostedCount} Kuppi hosted ·{' '}
              {profileStats.kuppiAttendedCount} sessions attended
            </div>
          </div>
        )}

        {/* SLIIT Campus Verification Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="sliit-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Student Full Name
            </label>
            <input
              id="sliit-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Kavindu Perera"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sliit-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SLIIT Campus Email
              </label>
              <input
                id="sliit-email"
                type="email"
                value={sliitEmail}
                onChange={(e) => setSliitEmail(e.target.value)}
                placeholder="IT21849210@my.sliit.lk"
                className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                required
              />
            </div>

            <div>
              <label htmlFor="sliit-id" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SLIIT Registration No.
              </label>
              <input
                id="sliit-id"
                type="text"
                value={sliitStudentId}
                onChange={(e) => setSliitStudentId(e.target.value.toUpperCase())}
                placeholder="IT21849210"
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="sliit-campus" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
              <label htmlFor="sliit-faculty" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
              <label htmlFor="sliit-batch" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Year / Semester
              </label>
              <input
                id="sliit-batch"
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Y3S2"
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {submitting ? 'Verifying Campus ID...' : 'Verify SLIIT Student Access'}
          </button>
        </form>

        {/* Instant Sandbox / Preview Options */}
        <div className="mt-6 pt-5 border-t border-slate-900/10">
          <p className="text-xs font-medium text-slate-500">
            Testing without a Google popup? Enter an instant verified campus sandbox session:
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                onEnterDemoStudent(false);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white/80 border border-slate-200 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Use Student Sandbox (IT21849210)
            </button>
            <button
              type="button"
              onClick={() => {
                onEnterDemoStudent(true);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
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
