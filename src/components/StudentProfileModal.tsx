import { ArrowUpRight, Award, Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Gig, KuppiSession, Order, StudentProfileStats } from '../types/marketplace';
import { computeStudentProfileStats, formatLkr, type StudentIdentitySeed } from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface StudentProfileModalProps {
  identity: StudentIdentitySeed | null;
  gigs: Gig[];
  orders: Order[];
  kuppiSessions: KuppiSession[];
  onClose: () => void;
  onSelectGig?: (gig: Gig) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function StudentProfileModal({
  identity,
  gigs,
  orders,
  kuppiSessions,
  onClose,
  onSelectGig,
}: StudentProfileModalProps) {
  const stats: StudentProfileStats | null = identity
    ? computeStudentProfileStats(identity, gigs, orders, kuppiSessions)
    : null;
  const studentGigs = stats ? gigs.filter((g) => g.sellerId === stats.uid && g.status === 'active') : [];
  const studentSessions = stats
    ? kuppiSessions.filter((s) => s.hostId === stats.uid || s.attendeeIds.includes(stats.uid))
    : [];
  const lockedBadges = stats ? stats.badges.filter((b) => !b.earned) : [];

  return (
    <AnimatePresence>
      {identity && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-profile-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="glass-panel bg-white/92 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
        <div className="sticky top-0 z-10 bg-white/88 backdrop-blur-md border-b border-slate-900/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <Award className="w-4 h-4" />
            <span>SLIIT Student Achievement Profile</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student profile"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Student Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1F3A] text-white font-display text-lg font-bold flex items-center justify-center shrink-0 shadow-sm">
              {getInitials(stats.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="student-profile-title" className="font-display text-2xl font-bold text-slate-900 truncate">
                {stats.displayName}
              </h2>
              <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                {stats.sliitStudentId && <span className="font-mono-num font-semibold text-slate-800">{stats.sliitStudentId}</span>}
                {stats.sliitStudentId && stats.campus && <span aria-hidden="true">·</span>}
                {stats.campus && <span>{stats.campus} Campus</span>}
                {stats.faculty && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Faculty of {stats.faculty}</span>
                  </>
                )}
              </div>
            </div>
            <div className="font-mono-num text-xs font-semibold text-[#0B1F3A] bg-white/80 border border-slate-200 rounded-xl px-3.5 py-2 shrink-0">
              {stats.earnedBadges.length} / {stats.badges.length} Badges
            </div>
          </div>

          {/* 4 Live Activity Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-subtle rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Completed Orders</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-slate-900">{stats.totalCompletedOrders}</div>
              <div className="text-[10.5px] text-slate-500 font-mono-num whitespace-nowrap">
                {stats.completedSellerOrders} sold · {stats.completedBuyerOrders} bought
              </div>
            </div>

            <div className="glass-subtle rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Seller Rating</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-amber-700">
                {stats.totalReviews > 0 ? `★ ${stats.avgSellerRating.toFixed(1)}` : 'New'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono-num">{stats.totalReviews} reviews</div>
            </div>

            <div className="glass-subtle rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Kuppi Hosted</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#0B1F3A]">{stats.kuppiHostedCount}</div>
              <div className="text-[11px] text-slate-500">Peer sessions led</div>
            </div>

            <div className="glass-subtle rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Sessions Attended</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-emerald-700">{stats.kuppiAttendedCount}</div>
              <div className="text-[11px] text-slate-500">Kuppi &amp; Study</div>
            </div>
          </div>

          {/* Earned Achievement Badges */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Earned Achievement Badges</h3>
              <span className="font-mono-num text-xs text-slate-500">{stats.earnedBadges.length} unlocked</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="earned-badges-grid">
              {stats.earnedBadges.map((badge) => (
                <AchievementBadgeChip key={badge.id} badge={badge} variant="card" />
              ))}
            </div>
          </section>

          {/* Milestones to Unlock */}
          {lockedBadges.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-slate-700">Milestones to Unlock</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lockedBadges.map((badge) => (
                  <AchievementBadgeChip key={badge.id} badge={badge} variant="card" />
                ))}
              </div>
            </section>
          )}

          {/* Active Services & Sessions by this Student */}
          {(studentGigs.length > 0 || studentSessions.length > 0) && (
            <section className="pt-4 border-t border-slate-900/10 space-y-3">
              <h3 className="font-display text-sm font-semibold text-slate-800">Campus Contributions</h3>
              <div className="space-y-2">
                {studentGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="glass-subtle rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        {gig.category} · {gig.sellerCampus}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">{gig.title}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono-num text-xs font-bold text-slate-800">
                        {gig.isFree || gig.priceLkr === 0 ? 'FREE' : formatLkr(gig.priceLkr)}
                      </span>
                      {onSelectGig && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectGig(gig);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0B1F3A] bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          View
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {studentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="glass-subtle rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="font-mono-num font-semibold text-amber-700">{session.moduleCode}</span>
                      <span className="text-slate-800 font-medium truncate">{session.title}</span>
                    </div>
                    <span className="font-mono-num text-slate-500 whitespace-nowrap shrink-0">
                      {session.hostId === stats.uid ? 'Host' : 'Attending'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
