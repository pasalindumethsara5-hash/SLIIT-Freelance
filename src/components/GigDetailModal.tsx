import { ArrowUpRight, Check, HeartHandshake, Lock, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import type { Gig, StudentProfileStats, UserProfile } from '../types/marketplace';
import {
  calculateCommissionSplit,
  formatLkr,
  sanitizeTextInput,
  type StudentIdentitySeed,
} from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface GigDetailModalProps {
  gig: Gig | null;
  sellerStats: StudentProfileStats | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
  onOpenGate: () => void;
  onPlaceOrder: (gig: Gig, requirements: string) => Promise<void>;
}

export function GigDetailModal({
  gig,
  sellerStats,
  currentUser,
  onClose,
  onOpenProfile,
  onOpenGate,
  onPlaceOrder,
}: GigDetailModalProps) {
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const isFree = gig ? gig.isFree || gig.priceLkr === 0 : false;
  const split = calculateCommissionSplit(gig && !isFree ? gig.priceLkr : 0);
  const isOwnGig = Boolean(gig && currentUser?.uid === gig.sellerId);

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!gig) return;
    setError(null);

    if (!currentUser) {
      onOpenGate();
      return;
    }

    if (isOwnGig) {
      setError('You cannot place an order on your own service listing.');
      return;
    }

    const cleanRequirements = sanitizeTextInput(requirements, 1200);
    if (cleanRequirements.length < 10) {
      setError('Please enter project requirements (at least 10 characters) for the student seller.');
      return;
    }

    setPlacing(true);
    try {
      await onPlaceOrder(gig, cleanRequirements);
      setRequirements('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {gig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gig-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="glass-panel bg-white/90 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-slate-900/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
            <span className={isFree ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-700'}>
              {gig.category}
            </span>
            <span aria-hidden="true">·</span>
            <span>{gig.sellerCampus} Campus</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{gig.sellerSliitId}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close service details"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Service Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-white/80 shadow-xs">
              <img
                src={gig.imageUrl}
                alt={gig.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 id="gig-modal-title" className="font-display text-2xl font-bold text-slate-900 leading-snug">
                {gig.title}
              </h2>
              <div className="mt-2 text-sm text-slate-600 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile({
                      uid: gig.sellerId,
                      displayName: gig.sellerName,
                      sliitStudentId: gig.sellerSliitId,
                      campus: gig.sellerCampus,
                      faculty: gig.sellerFaculty,
                      verifiedCampus: true,
                    });
                  }}
                  className="font-semibold text-slate-900 hover:text-[#0B1F3A] hover:underline cursor-pointer"
                >
                  {gig.sellerName}
                </button>
                <span aria-hidden="true">·</span>
                <span>Faculty of {gig.sellerFaculty}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num text-amber-700 font-medium">
                  ★ {gig.rating.toFixed(1)} ({gig.reviewCount} reviews)
                </span>
              </div>
            </div>

            {sellerStats && sellerStats.earnedBadges.length > 0 && (
              <div className="glass-subtle rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Seller Achievement Badges ({sellerStats.earnedBadges.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProfile({
                        uid: gig.sellerId,
                        displayName: gig.sellerName,
                        sliitStudentId: gig.sellerSliitId,
                        campus: gig.sellerCampus,
                        faculty: gig.sellerFaculty,
                        verifiedCampus: true,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1F3A] hover:underline cursor-pointer"
                  >
                    Full Profile
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sellerStats.earnedBadges.map((badge) => (
                    <AchievementBadgeChip key={badge.id} badge={badge} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-700 leading-relaxed">{gig.description}</p>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 tracking-wide">Included Deliverables</h3>
              <ul className="mt-2.5 space-y-2">
                {gig.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Contiguous Purchase / Free Request & 25% Split Module */}
          <div className="lg:col-span-5">
            <form onSubmit={handleCheckout} className="glass-subtle rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-slate-600">
                  {isFree ? 'Community Peer Service' : 'Order Total'}
                </span>
                <span className={`font-mono-num text-2xl font-bold ${isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {isFree ? 'FREE · LKR 0' : formatLkr(split.grossAmountLkr)}
                </span>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="font-mono-num">{gig.deliveryDays} day delivery</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{gig.revisions} revisions</span>
              </div>

              {/* Transparent Commission Breakdown */}
              <div className="pt-3 border-t border-slate-900/10 space-y-2 text-xs">
                {isFree ? (
                  <div className="flex items-center justify-between text-emerald-800">
                    <span>Volunteer Fee &amp; Commission</span>
                    <span className="font-mono-num font-semibold">LKR 0 (0% Fee)</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Seller Net Payout (75%)</span>
                      <span className="font-mono-num font-semibold text-emerald-700">
                        {formatLkr(split.sellerPayoutLkr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>SLIIT Hub Platform Fee (25%)</span>
                      <span className="font-mono-num font-semibold text-amber-700">
                        {formatLkr(split.platformFeeLkr)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div role="alert" className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="order-requirements" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isFree ? 'What do you need help with?' : 'Project Brief & Requirements'}
                </label>
                <textarea
                  id="order-requirements"
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={
                    isFree
                      ? 'Share your module code, bug, or topic and preferred campus/online time...'
                      : 'Describe your module, deadline, tech stack, or submission format...'
                  }
                  className="w-full px-3 py-2 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />
              </div>

              {currentUser ? (
                <button
                  type="submit"
                  disabled={placing || isOwnGig}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 rounded-xl transition-colors cursor-pointer ${
                    isFree ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#0B1F3A] hover:bg-slate-800'
                  }`}
                >
                  {isFree ? <HeartHandshake className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  {placing
                    ? 'Creating Campus Request...'
                    : isFree
                    ? 'Request Free Peer Help (LKR 0)'
                    : `Place Campus Order (${formatLkr(split.grossAmountLkr)})`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenGate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Verify SLIIT ID to Continue
                </button>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isFree
                  ? 'Free community help carries 0% platform commission and lets SLIIT peers collaborate safely.'
                  : 'Funds remain escrowed until you confirm delivery. 25% platform fee is automatically routed to the platform revenue ledger upon completion.'}
              </p>
            </form>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
