import { Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { AchievementBadge, Gig, StudentProfileStats } from '../types/marketplace';
import { formatLkr, type StudentIdentitySeed } from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface GigCardProps {
  gig: Gig;
  sellerStats: StudentProfileStats;
  index?: number;
  onSelect: (gig: Gig) => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
}

const PAID_BADGE_PRIORITY: AchievementBadge['id'][] = [
  'top_rated_seller',
  'kuppi_master',
  'verified_closer',
  'free_mentor',
  'study_streak',
  'campus_verified',
];

const FREE_BADGE_PRIORITY: AchievementBadge['id'][] = [
  'free_mentor',
  'kuppi_master',
  'top_rated_seller',
  'verified_closer',
  'study_streak',
  'campus_verified',
];

function getFeaturedBadges(stats: StudentProfileStats, isFree: boolean): AchievementBadge[] {
  const order = isFree ? FREE_BADGE_PRIORITY : PAID_BADGE_PRIORITY;
  const picked: AchievementBadge[] = [];
  for (const id of order) {
    const match = stats.earnedBadges.find((b) => b.id === id);
    if (match) {
      picked.push(match);
      if (picked.length === 2) break;
    }
  }
  return picked;
}

export function GigCard({ gig, sellerStats, index = 0, onSelect, onOpenProfile }: GigCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const isFree = gig.isFree || gig.priceLkr === 0;
  const featuredBadges = getFeaturedBadges(sellerStats, isFree);
  const remainingCount = Math.max(0, sellerStats.earnedBadges.length - featuredBadges.length);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.22), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group glass-card rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-xl flex flex-col"
    >
      <div className="aspect-[4/3] w-full bg-slate-100/80 overflow-hidden relative">
        {!imgFailed && gig.imageUrl ? (
          <img
            src={gig.imageUrl}
            alt={gig.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-center">
            <Briefcase className="w-7 h-7 text-slate-400 mb-2" />
            <span className="text-xs font-medium text-slate-600 line-clamp-2">{gig.category}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Zero-pill unboxed metadata with dot separators */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
          <span className={isFree ? 'font-semibold text-emerald-700' : 'font-medium text-slate-700'}>
            {gig.category}
          </span>
          <span aria-hidden="true">·</span>
          <span>{gig.sellerCampus}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num">{gig.deliveryDays}d delivery</span>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold text-slate-900 leading-snug line-clamp-2">
          <button
            type="button"
            onClick={() => onSelect(gig)}
            className="text-left hover:text-[#0B1F3A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A] cursor-pointer"
          >
            {gig.title}
          </button>
        </h3>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-600">
          <button
            type="button"
            onClick={() =>
              onOpenProfile({
                uid: gig.sellerId,
                displayName: gig.sellerName,
                sliitStudentId: gig.sellerSliitId,
                campus: gig.sellerCampus,
                faculty: gig.sellerFaculty,
                verifiedCampus: true,
              })
            }
            aria-label={`View achievement profile for ${gig.sellerName}`}
            className="inline-flex items-center gap-1.5 min-w-0 font-medium text-slate-800 hover:text-[#0B1F3A] hover:underline truncate cursor-pointer"
          >
            <span className="truncate">{gig.sellerName}</span>
            <span className="font-mono-num text-slate-500 shrink-0">{gig.sellerSliitId}</span>
          </button>

          <span className="font-mono-num text-amber-700 font-medium whitespace-nowrap shrink-0">
            ★ {gig.rating.toFixed(1)} ({gig.reviewCount})
          </span>
        </div>

        {featuredBadges.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {featuredBadges.map((badge) => (
                <AchievementBadgeChip key={badge.id} badge={badge} variant="compact" />
              ))}
            </div>
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  onOpenProfile({
                    uid: gig.sellerId,
                    displayName: gig.sellerName,
                    sliitStudentId: gig.sellerSliitId,
                    campus: gig.sellerCampus,
                    faculty: gig.sellerFaculty,
                    verifiedCampus: true,
                  })
                }
                className="font-mono-num text-[11px] font-medium text-slate-500 hover:text-[#0B1F3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                +{remainingCount} more
              </button>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-900/10 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500">{isFree ? 'Community Peer Help' : 'Campus Rate'}</div>
            <div className={`font-mono-num text-sm font-semibold ${isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
              {isFree ? 'FREE · LKR 0' : formatLkr(gig.priceLkr)}
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(gig)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              isFree
                ? 'text-emerald-900 bg-emerald-100/80 hover:bg-emerald-700 hover:text-white'
                : 'text-[#0B1F3A] bg-white/80 border border-slate-200/80 hover:bg-[#0B1F3A] hover:text-white'
            }`}
          >
            {isFree ? 'Request Free Help' : 'View & Order'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}


