import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  HeartHandshake,
  Landmark,
  Lock,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  OFFICIAL_CAMPUS_BANK_DETAILS,
  type Gig,
  type StudentProfileStats,
  type UserProfile,
} from '../types/marketplace';
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
  onPlaceOrder: (gig: Gig, requirements: string, receiptUrl?: string) => Promise<void>;
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
  const [copiedBank, setCopiedBank] = useState(false);

  // Bank receipt upload state
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  const isFree = gig ? gig.isFree || gig.priceLkr === 0 : false;
  const split = calculateCommissionSplit(gig && !isFree ? gig.priceLkr : 0);
  const isOwnGig = Boolean(gig && currentUser?.uid === gig.sellerId);

  const handleReceiptUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt file size must be less than 5MB.');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptUrl(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the receipt file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearReceipt = () => {
    setReceiptUrl(null);
    setReceiptFileName(null);
  };

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

    if (!isFree && !receiptUrl) {
      setError('Please transfer payment to the bank account and upload your payment receipt slip to continue.');
      return;
    }

    setPlacing(true);
    try {
      await onPlaceOrder(gig, cleanRequirements, receiptUrl || undefined);
      setRequirements('');
      setReceiptUrl(null);
      setReceiptFileName(null);
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

              {/* Manual Bank Transfer & Receipt Upload for Paid Orders */}
              {!isFree && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wide">
                      <Landmark className="w-3.5 h-3.5 text-amber-700" />
                      <span>Official Campus Bank Transfer</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                      Escrow Deposit
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Transfer <span className="font-bold font-mono-num">{formatLkr(split.grossAmountLkr)}</span> to the verified SLIIT platform account, then upload your slip:
                  </p>

                  <div className="bg-white/90 rounded-xl p-3 border border-amber-200/60 text-xs space-y-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank:</span>
                      <span className="font-semibold text-slate-800">{OFFICIAL_CAMPUS_BANK_DETAILS.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-semibold text-slate-800">{OFFICIAL_CAMPUS_BANK_DETAILS.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-num font-bold text-slate-900 bg-amber-100/70 px-2 py-0.5 rounded text-xs">
                          {OFFICIAL_CAMPUS_BANK_DETAILS.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(OFFICIAL_CAMPUS_BANK_DETAILS.accountNumber);
                            setCopiedBank(true);
                            setTimeout(() => setCopiedBank(false), 2000);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                          title="Copy Account Number"
                        >
                          {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Branch:</span>
                      <span className="font-semibold text-slate-800">{OFFICIAL_CAMPUS_BANK_DETAILS.branch}</span>
                    </div>
                  </div>

                  {/* Upload Receipt Section */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Upload Bank Transfer Receipt Slip <span className="text-red-500">*</span>
                    </label>

                    {receiptUrl ? (
                      <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {receiptUrl.startsWith('data:image/') ? (
                            <img
                              src={receiptUrl}
                              alt="Receipt preview"
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">
                              {receiptFileName || 'payment_receipt.png'}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Receipt attached
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearReceipt}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl bg-white/60 hover:bg-white/90 cursor-pointer transition-colors group">
                        <UploadCloud className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click to upload bank transfer slip
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          PNG, JPG, or PDF (Max 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
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
                    : receiptUrl
                    ? `Upload Receipt & Place Escrow Order (${formatLkr(split.grossAmountLkr)})`
                    : `Pay & Upload Receipt (${formatLkr(split.grossAmountLkr)})`}
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
