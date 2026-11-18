import { HeartHandshake, Lock, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { CATEGORY_DEFAULT_IMAGES } from '../data/seedData';
import { GIG_CATEGORIES, type Gig, type GigCategory, type UserProfile } from '../types/marketplace';
import {
  calculateCommissionSplit,
  calculateGrossFromDesiredPayout,
  formatLkr,
  sanitizeTextInput,
  validateGigInput,
} from '../utils/campusRules';

interface SellServiceViewProps {
  currentUser: UserProfile | null;
  onOpenGate: () => void;
  onCreateGig: (gig: Omit<Gig, 'id' | 'createdAtMs'>) => Promise<void>;
}

export function SellServiceView({ currentUser, onOpenGate, onCreateGig }: SellServiceViewProps) {
  const [listingTier, setListingTier] = useState<'paid' | 'free'>('paid');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GigCategory>('Software & Web');
  const [description, setDescription] = useState('');
  const [pricingMode, setPricingMode] = useState<'gross' | 'seller_net'>('gross');
  const [amountInput, setAmountInput] = useState<number>(10000);
  const [deliveryDays, setDeliveryDays] = useState<number>(3);
  const [revisions, setRevisions] = useState<number>(2);
  const [deliverablesText, setDeliverablesText] = useState(
    'Source code repository\nDeployment guide & walkthrough'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isFree = listingTier === 'free';
  const safeAmount = Number.isFinite(amountInput) && amountInput >= 0 ? amountInput : 0;
  const split = isFree
    ? calculateCommissionSplit(0)
    : pricingMode === 'gross'
    ? calculateCommissionSplit(safeAmount)
    : calculateGrossFromDesiredPayout(safeAmount);

  const handleTierSwitch = (tier: 'paid' | 'free') => {
    setListingTier(tier);
    if (tier === 'free') {
      setCategory('Free Peer Help');
    } else if (category === 'Free Peer Help') {
      setCategory('Software & Web');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenGate();
      return;
    }

    const cleanTitle = sanitizeTextInput(title, 120);
    const cleanDescription = sanitizeTextInput(description, 1500);
    const deliverables = deliverablesText
      .split('\n')
      .map((line) => sanitizeTextInput(line, 100))
      .filter(Boolean);

    const validation = validateGigInput({
      title: cleanTitle,
      description: cleanDescription,
      category,
      isFree,
      priceLkr: split.grossAmountLkr,
      deliveryDays,
      revisions,
      deliverables,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onCreateGig({
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName,
        sellerSliitId: currentUser.sliitStudentId,
        sellerCampus: currentUser.campus,
        sellerFaculty: currentUser.faculty,
        title: cleanTitle,
        description: cleanDescription,
        category,
        isFree,
        priceLkr: split.grossAmountLkr,
        platformFeeLkr: split.platformFeeLkr,
        sellerPayoutLkr: split.sellerPayoutLkr,
        deliveryDays,
        revisions,
        deliverables,
        imageUrl: CATEGORY_DEFAULT_IMAGES[category] ?? CATEGORY_DEFAULT_IMAGES['Software & Web'],
        rating: 5.0,
        reviewCount: 0,
        status: 'active',
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Unable to publish service.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide">
            Seller &amp; Volunteer Studio · Verified Students Only
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#0B1F3A]">
            Publish a Paid or Free Campus Service
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Offer paid freelance gigs (75% to you, 25% to SLIIT Freelance Hub) or publish a free volunteer peer-help
            listing (LKR 0 · 0% fee) for juniors and campus teammates.
          </p>
        </div>

        {!currentUser && (
          <button
            type="button"
            onClick={onOpenGate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Verify SLIIT ID First
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
          {errors.form && (
            <div role="alert" className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {errors.form}
            </div>
          )}

          {/* Paid vs Free Listing Tier Toggle */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">Listing Tier</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70">
              <button
                type="button"
                onClick={() => handleTierSwitch('paid')}
                className={`relative px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  listingTier === 'paid' ? 'text-[#0B1F3A]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {listingTier === 'paid' && (
                  <motion.span
                    layoutId="sell-tier-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">Paid Service (25% Fee)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTierSwitch('free')}
                className={`relative px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  listingTier === 'free' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {listingTier === 'free' && (
                  <motion.span
                    layoutId="sell-tier-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 bg-emerald-700 rounded-lg shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">Free Peer Help (LKR 0)</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="gig-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Service Title
            </label>
            <input
              id="gig-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isFree
                  ? 'e.g. Free Y1 Java OOP Debugging & Git Branch Walkthrough'
                  : 'e.g. Build a Spring Boot + React Microservice Assignment'
              }
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="gig-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                id="gig-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GigCategory)}
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              >
                {GIG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gig-delivery" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery (Days)
              </label>
              <input
                id="gig-delivery"
                type="number"
                min={1}
                max={30}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.deliveryDays && <p className="mt-1 text-xs text-red-600">{errors.deliveryDays}</p>}
            </div>

            <div>
              <label htmlFor="gig-revisions" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Revisions
              </label>
              <input
                id="gig-revisions"
                type="number"
                min={0}
                max={10}
                value={revisions}
                onChange={(e) => setRevisions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.revisions && <p className="mt-1 text-xs text-red-600">{errors.revisions}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="gig-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Service Scope &amp; Description
            </label>
            <textarea
              id="gig-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain tools, frameworks, what is included, and turnaround expectations..."
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="gig-deliverables" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deliverables (one per line, max 8)
            </label>
            <textarea
              id="gig-deliverables"
              rows={3}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            {errors.deliverables && <p className="mt-1 text-xs text-red-600">{errors.deliverables}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 rounded-xl transition-colors cursor-pointer ${
              isFree ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#0B1F3A] hover:bg-slate-800'
            }`}
          >
            {isFree ? <HeartHandshake className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {submitting
              ? 'Publishing Service...'
              : currentUser
              ? isFree
                ? 'Publish Free Community Service (LKR 0)'
                : `Publish Service at ${formatLkr(split.grossAmountLkr)}`
              : 'Verify SLIIT ID & Publish'}
          </button>
        </form>

        {/* Live 25% / 75% Commission Calculator Column */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {isFree ? 'Free Peer Help Summary' : 'Live 25% Commission Split'}
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              {isFree
                ? 'Volunteer listings have LKR 0 buyer charge and LKR 0 platform commission.'
                : 'Preview how buyer checkout price splits between the platform owner (25%) and you (75%).'}
            </p>
          </div>

          {!isFree ? (
            <>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70">
                <button
                  type="button"
                  onClick={() => setPricingMode('gross')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    pricingMode === 'gross' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Set Buyer Price
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('seller_net')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    pricingMode === 'seller_net'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Set My Take-Home
                </button>
              </div>

              <div>
                <label htmlFor="gig-price-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pricingMode === 'gross' ? 'Customer Listed Price (LKR)' : 'Desired Seller Payout (LKR)'}
                </label>
                <input
                  id="gig-price-input"
                  type="number"
                  min={500}
                  max={500000}
                  step={100}
                  value={amountInput}
                  onChange={(e) => setAmountInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-base font-mono-num font-semibold glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />
                {errors.priceLkr && <p className="mt-1 text-xs text-red-600">{errors.priceLkr}</p>}
              </div>
            </>
          ) : (
            <div className="glass-subtle rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed">
              Your listing will appear in the <strong>Free Peer Help (LKR 0)</strong> filter so SLIIT students can
              request guidance without any payment or fee.
            </div>
          )}

          <div className="pt-4 border-t border-slate-900/10 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Buyer Pays</span>
              <span data-testid="calc-gross" className="font-mono-num font-bold text-slate-900">
                {formatLkr(split.grossAmountLkr)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Platform Commission ({isFree ? '0%' : '25%'})</span>
              <span data-testid="calc-fee" className="font-mono-num font-bold text-amber-700">
                - {formatLkr(split.platformFeeLkr)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-900/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Seller Net Earnings ({isFree ? 'Free' : '75%'})
              </span>
              <span data-testid="calc-seller" className="font-mono-num text-xl font-bold text-emerald-700">
                {formatLkr(split.sellerPayoutLkr)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
