import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  MapPin,
  PlusCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Gig, KuppiSession, Order, UserProfile } from '../types/marketplace';
import { computeStudentProfileStats, formatLkr } from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface MyProfileViewProps {
  currentUser: UserProfile | null;
  gigs: Gig[];
  orders: Order[];
  kuppiSessions: KuppiSession[];
  onOpenGate: () => void;
  onEnterDemoStudent: (asFounder?: boolean) => void;
  onSelectGig: (gig: Gig) => void;
  onNavigateSell: () => void;
  onNavigateKuppi: () => void;
  onNavigateOrders: () => void;
  onExploreMyCampus: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function MyProfileView({
  currentUser,
  gigs,
  orders,
  kuppiSessions,
  onOpenGate,
  onEnterDemoStudent,
  onSelectGig,
  onNavigateSell,
  onNavigateKuppi,
  onNavigateOrders,
  onExploreMyCampus,
}: MyProfileViewProps) {
  if (!currentUser) {
    return (
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6"
        >
          <div className="mx-auto w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-white/80 bg-[#071527]">
            <img
              src="/assets/aistudio/image_904ea47c.png"
              alt="SLIIT Freelance Hub official emblem"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <p className="text-xs font-semibold text-amber-700 tracking-wide">
              Personal SLIIT Profile &amp; Achievement Showcase
            </p>
            <h1 className="font-display text-3xl font-bold text-[#0B1F3A]">
              Verify Your SLIIT ID to View Your Profile
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlock your personal student profile to track earned badges (Top Rated Seller, Kuppi Master, Verified
              Closer, Study Streak), active paid/free services, Kuppi attendance, and campus escrow payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenGate}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify @my.sliit.lk Access
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEnterDemoStudent(false)}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B1F3A] bg-white/85 border border-white hover:bg-white rounded-xl shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              Enter Student Sandbox (IT21849210)
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stats = computeStudentProfileStats(
    {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      sliitStudentId: currentUser.sliitStudentId,
      campus: currentUser.campus,
      faculty: currentUser.faculty,
      verifiedCampus: currentUser.verifiedCampus,
    },
    gigs,
    orders,
    kuppiSessions
  );

  const myGigs = gigs.filter((g) => g.sellerId === currentUser.uid && g.status === 'active');
  const mySessions = kuppiSessions.filter(
    (s) => s.hostId === currentUser.uid || s.attendeeIds.includes(currentUser.uid)
  );
  const myOrders = orders.filter((o) => o.buyerId === currentUser.uid || o.sellerId === currentUser.uid);
  const lockedBadges = stats.badges.filter((b) => !b.earned);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-8" data-testid="my-profile-view">
      {/* Hero Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-3xl p-6 sm:p-8 space-y-7"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0B1F3A] text-white font-display text-2xl font-bold flex items-center justify-center shrink-0 shadow-md">
              {getInitials(currentUser.displayName)}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <Award className="w-4 h-4" />
                <span>Verified SLIIT Student Profile</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] truncate">
                {currentUser.displayName}
              </h1>
              <div className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-mono-num font-semibold text-slate-900">{currentUser.sliitStudentId}</span>
                <span aria-hidden="true">·</span>
                <span>{currentUser.campus} Campus</span>
                <span aria-hidden="true">·</span>
                <span>Faculty of {currentUser.faculty}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{currentUser.batch}</span>
              </div>
              <div className="font-mono-num text-xs text-slate-500">{currentUser.sliitEmail}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreMyCampus}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#0B1F3A] bg-white/85 border border-white hover:bg-white rounded-xl shadow-xs whitespace-nowrap cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              Browse {currentUser.campus} Campus
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenGate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl shadow-sm whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Switch / Manage Access
            </motion.button>
          </div>
        </div>

        {/* 4 Live Profile Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-900/10">
          {[
            {
              label: 'Completed Orders',
              value: String(stats.totalCompletedOrders),
              sub: `${stats.completedSellerOrders} sold · ${stats.completedBuyerOrders} bought`,
              tone: 'text-[#0B1F3A]',
            },
            {
              label: 'Seller Rating',
              value: stats.totalReviews > 0 ? `★ ${stats.avgSellerRating.toFixed(1)}` : 'New',
              sub: `${stats.totalReviews} verified reviews`,
              tone: 'text-amber-700',
            },
            {
              label: 'Kuppi Hosted',
              value: String(stats.kuppiHostedCount),
              sub: 'Peer classes led',
              tone: 'text-[#0B1F3A]',
            },
            {
              label: 'Sessions Attended',
              value: String(stats.kuppiAttendedCount),
              sub: `${stats.earnedBadges.length}/${stats.badges.length} badges unlocked`,
              tone: 'text-emerald-700',
            },
          ].map((tile, idx) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.04 }}
              className="glass-subtle rounded-2xl p-4"
            >
              <div className="text-xs font-medium text-slate-600">{tile.label}</div>
              <div className={`mt-1 font-mono-num text-2xl font-bold ${tile.tone}`}>{tile.value}</div>
              <div className="mt-0.5 font-mono-num text-[11px] text-slate-500 whitespace-nowrap">{tile.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Achievement Badges & Milestones */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0B1F3A]">Your Visual Achievement Badges</h2>
            <p className="text-xs text-slate-600">
              Earned automatically from completed marketplace orders, ratings, free peer help, and Kuppi/Study attendance.
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-[#0B1F3A] bg-white/80 border border-white rounded-xl px-3.5 py-2 self-start">
            {stats.earnedBadges.length} / {stats.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" data-testid="my-profile-earned-badges">
          {stats.earnedBadges.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
            >
              <AchievementBadgeChip badge={badge} variant="card" />
            </motion.div>
          ))}
        </div>

        {lockedBadges.length > 0 && (
          <div className="pt-4 border-t border-slate-900/10 space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-700">Milestones to Unlock Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {lockedBadges.map((badge) => (
                <AchievementBadgeChip key={badge.id} badge={badge} variant="card" />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Personal Services, Kuppi & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Services */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-700" />
                My Services ({myGigs.length})
              </h2>
            </div>

            {myGigs.length > 0 ? (
              <div className="space-y-2.5">
                {myGigs.map((gig) => (
                  <div key={gig.id} className="glass-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500">{gig.category}</div>
                      <div className="text-xs font-semibold text-slate-900 truncate">{gig.title}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectGig(gig)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#0B1F3A] bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shrink-0 cursor-pointer"
                    >
                      {gig.isFree || gig.priceLkr === 0 ? 'FREE' : formatLkr(gig.priceLkr)}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 glass-subtle rounded-xl p-4 leading-relaxed">
                You haven&rsquo;t published a service yet. Post a Paid Gig (75% net) or a Free Peer Help service to unlock{' '}
                <strong>Free Peer Mentor</strong>!
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigateSell}
            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Post Paid or Free Service
          </button>
        </section>

        {/* My Kuppi & Study Schedule */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              My Kuppi &amp; Study ({mySessions.length})
            </h2>

            {mySessions.length > 0 ? (
              <div className="space-y-2.5">
                {mySessions.map((session) => (
                  <div key={session.id} className="glass-subtle rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono-num font-semibold text-amber-700">{session.moduleCode}</span>
                      <span className="font-mono-num text-slate-500">
                        {session.hostId === currentUser.uid ? 'Hosting' : 'Joined'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">{session.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{session.scheduleLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 glass-subtle rounded-xl p-4 leading-relaxed">
                No joined Kuppi or Study Together sessions yet. Reserve a seat to unlock <strong>Study Streak</strong> and{' '}
                <strong>Kuppi Master</strong>!
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigateKuppi}
            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold text-[#0B1F3A] bg-white/85 border border-slate-200 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            Open Kuppi &amp; Study Hub
          </button>
        </section>

        {/* My Orders Summary */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">My Orders ({myOrders.length})</h2>

            {myOrders.length > 0 ? (
              <div className="space-y-2.5">
                {myOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="glass-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono-num text-[11px] text-slate-500">
                        {order.id} · {order.status.replace('_', ' ')}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 truncate">{order.gigTitle}</div>
                    </div>
                    <span className="font-mono-num text-xs font-bold text-slate-800 shrink-0">
                      {order.grossAmountLkr === 0 ? 'FREE' : formatLkr(order.grossAmountLkr)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 glass-subtle rounded-xl p-4 leading-relaxed">
                No personal orders yet. Hire a peer or complete a delivery to unlock <strong>Verified Closer</strong>.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigateOrders}
            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold text-[#0B1F3A] bg-white/85 border border-slate-200 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            View All Orders &amp; 25% Ledger
          </button>
        </section>
      </div>
    </div>
  );
}
