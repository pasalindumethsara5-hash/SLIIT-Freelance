import { ArrowRight, BookOpen, Calendar, MapPin, RotateCcw, Search, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { HERO_BANNER_IMAGE } from '../data/seedData';
import {
  CAMPUS_BRANCHES,
  GIG_CATEGORIES,
  type CampusBranch,
  type Gig,
  type GigCategory,
  type KuppiSession,
  type Order,
  type UserProfile,
} from '../types/marketplace';
import {
  computeStudentProfileStats,
  filterGigs,
  filterKuppiSessions,
  formatLkr,
  type GigFilterOptions,
  type StudentIdentitySeed,
} from '../utils/campusRules';
import { GigCard } from './GigCard';

interface MarketplaceViewProps {
  gigs: Gig[];
  orders: Order[];
  kuppiSessions: KuppiSession[];
  currentUser: UserProfile | null;
  campus: CampusBranch | 'All';
  onCampusChange: (campus: CampusBranch | 'All') => void;
  onSelectGig: (gig: Gig) => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
  onToggleJoinKuppi: (sessionId: string) => Promise<void>;
  onOpenGate: () => void;
  onNavigateSell: () => void;
  onNavigateKuppi: () => void;
  onNavigateAi: () => void;
}

export function MarketplaceView({
  gigs,
  orders,
  kuppiSessions,
  currentUser,
  campus,
  onCampusChange,
  onSelectGig,
  onOpenProfile,
  onToggleJoinKuppi,
  onOpenGate,
  onNavigateSell,
  onNavigateKuppi,
  onNavigateAi,
}: MarketplaceViewProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GigCategory | 'All'>('All');
  const [pricingTier, setPricingTier] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<GigFilterOptions['sortBy']>('recommended');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const visibleGigs = filterGigs(gigs, { query, category, campus, pricingTier, sortBy });
  const matchingKuppi = filterKuppiSessions(kuppiSessions, {
    query,
    sessionType: 'all',
    campus,
  });
  const freeCount = gigs.filter((g) => g.status === 'active' && (g.isFree || g.priceLkr === 0)).length;
  const kuppiCount = kuppiSessions.length;

  const resetFilters = () => {
    setQuery('');
    setCategory('All');
    onCampusChange('All');
    setPricingTier('all');
    setSortBy('recommended');
  };

  return (
    <div className="space-y-10 pb-16 pt-6">
      {/* Section 1: Frosted Glass Split Hero + 4-Column Campus KPI Strip */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-amber-700 tracking-wide">
                Verified SLIIT Students Only · @my.sliit.lk · Hardened Campus Security
              </p>
              <h1
                className="mt-3 font-display font-bold text-[#0B1F3A] tracking-tight leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 3.8vw, 3.25rem)', textWrap: 'balance' }}
              >
                The campus freelance, Kuppi &amp; peer hub for SLIIT talent.
              </h1>
              <p className="mt-4 text-base text-slate-700 leading-relaxed max-w-xl">
                Hire verified peers across Malabe, Metro, Kandy, Matara, Kurunegala, and Jaffna—plus explore free
                student peer help, join live Kuppi &amp; Study Together groups, or ask SLIIT Campus AI. Paid services
                use an automated 25% platform fee and 75% seller payout.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {currentUser ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onNavigateSell}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl shadow-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Post Paid or Free Service
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenGate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl shadow-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Verify SLIIT ID to Start
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onNavigateKuppi}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold text-[#0B1F3A] bg-white/80 hover:bg-white border border-white/90 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  Kuppi &amp; Study ({kuppiCount})
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onNavigateAi}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 hover:text-[#0B1F3A] bg-white/60 hover:bg-white/90 border border-white/80 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Ask Campus AI
                </motion.button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="h-full min-h-[260px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-white/80 shadow-md bg-slate-100"
              >
                {!heroImgFailed ? (
                  <img
                    src={HERO_BANNER_IMAGE}
                    alt="SLIIT Malabe campus main building and student walkway"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B1F3A] to-slate-800 flex items-center justify-center p-8 text-white">
                    <span className="font-display text-xl font-semibold">SLIIT Campus Studio</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* 4-Column Frosted KPI Strip */}
          <div className="mt-10 pt-8 border-t border-slate-900/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-medium text-slate-600">Access Policy</div>
              <div className="mt-1 font-display text-lg font-bold text-[#0B1F3A]">SLIIT Campus Only</div>
              <div className="mt-0.5 text-xs text-slate-500">6 regional branches verified</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">Commission Split</div>
              <div className="mt-1 font-mono-num text-lg font-bold text-amber-700">25% Fee / 75% Net</div>
              <div className="mt-0.5 text-xs text-slate-500">0% fee on Free Peer Help</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">Free Community Help</div>
              <div className="mt-1 font-mono-num text-lg font-bold text-emerald-700">{freeCount} Free Sellers</div>
              <div className="mt-0.5 text-xs text-slate-500">Zero-cost student volunteers</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">Kuppi &amp; Study Groups</div>
              <div className="mt-1 font-mono-num text-lg font-bold text-slate-900">{kuppiCount} Live Sessions</div>
              <div className="mt-0.5 text-xs text-slate-500">Peer revision &amp; study halls</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: Filter Toolbar & 3-Column Glass Gig Grid */}
      <section id="campus-catalog" className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="gig-search" className="sr-only">
                Search SLIIT services
              </label>
              <input
                id="gig-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search React, Figma, Free Git help, LaTeX, Malabe..."
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>

            {/* Pricing Tier Segmented Filter + Campus Dropdown + Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Filter by pricing tier"
                className="inline-flex items-center gap-1 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70"
              >
                {(
                  [
                    { id: 'all', label: 'All Services' },
                    { id: 'free', label: 'Free (LKR 0)' },
                    { id: 'paid', label: 'Paid (25% Fee)' },
                  ] as const
                ).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setPricingTier(tier.id)}
                    aria-pressed={pricingTier === tier.id}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      pricingTier === tier.id ? 'text-[#0B1F3A]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pricingTier === tier.id && (
                      <motion.span
                        layoutId="pricing-tier-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{tier.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="campus-filter" className="sr-only">
                  Filter by SLIIT campus
                </label>
                <select
                  id="campus-filter"
                  value={campus}
                  onChange={(e) => onCampusChange(e.target.value as CampusBranch | 'All')}
                  className="px-3.5 py-2.5 text-sm glass-input rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                >
                  <option value="All">All SLIIT Campuses</option>
                  {CAMPUS_BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch} Campus
                    </option>
                  ))}
                </select>

                {currentUser && campus !== currentUser.campus && (
                  <button
                    type="button"
                    onClick={() => onCampusChange(currentUser.campus)}
                    className="px-3 py-2 text-xs font-semibold text-[#0B1F3A] bg-white/80 border border-white hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    My Campus ({currentUser.campus})
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="sort-filter" className="sr-only">
                  Sort services
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as GigFilterOptions['sortBy'])}
                  className="px-3.5 py-2.5 text-sm glass-input rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                >
                  <option value="recommended">Top Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="fastest">Fastest Delivery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Animated Category Segmented Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Service categories">
            <button
              type="button"
              role="tab"
              aria-selected={category === 'All'}
              onClick={() => setCategory('All')}
              className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                category === 'All' ? 'text-white' : 'bg-white/70 border border-white/80 text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {category === 'All' && (
                <motion.span
                  layoutId="category-tab-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute inset-0 bg-[#0B1F3A] rounded-xl shadow-xs"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">All Categories</span>
            </button>
            {GIG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  category === cat ? 'text-white' : 'bg-white/70 border border-white/80 text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {category === cat && (
                  <motion.span
                    layoutId="category-tab-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 bg-[#0B1F3A] rounded-xl shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1">
          <span className="font-mono-num">
            Showing {visibleGigs.length} of {gigs.length} campus services
            {campus !== 'All' ? ` · Filtered to ${campus} Campus` : ''}
          </span>
          {(query || category !== 'All' || campus !== 'All' || pricingTier !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* 3-Column Gig Grid or Empty State */}
        {visibleGigs.length > 0 ? (
          <div data-testid="gigs-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleGigs.map((gig, index) => {
              const sellerStats = computeStudentProfileStats(
                {
                  uid: gig.sellerId,
                  displayName: gig.sellerName,
                  sliitStudentId: gig.sellerSliitId,
                  campus: gig.sellerCampus,
                  faculty: gig.sellerFaculty,
                  verifiedCampus: true,
                },
                gigs,
                orders,
                kuppiSessions
              );
              return (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  sellerStats={sellerStats}
                  index={index}
                  onSelect={onSelectGig}
                  onOpenProfile={onOpenProfile}
                />
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              No matching SLIIT services {campus !== 'All' ? `at ${campus} Campus` : 'found'}
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Try clearing your pricing tier, switching to All SLIIT Campuses, or refining your search keywords.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Section 3: Campus-Synced Kuppi & Study Together Preview */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4" data-testid="marketplace-kuppi-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold text-amber-700 tracking-wide">
              Campus-Matched Peer Learning
            </p>
            <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
              {campus === 'All'
                ? 'Live Kuppi & Study Together Sessions'
                : `Kuppi & Study Sessions at ${campus} Campus`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onNavigateKuppi}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Open Full Kuppi &amp; Study Hub ({matchingKuppi.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {matchingKuppi.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matchingKuppi.slice(0, 4).map((session, idx) => {
              const isJoined = Boolean(currentUser && session.attendeeIds.includes(currentUser.uid));
              const isFree = session.priceLkr === 0;
              return (
                <motion.article
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span
                        className={`font-semibold ${
                          session.sessionType === 'kuppi' ? 'text-[#0B1F3A]' : 'text-emerald-700'
                        }`}
                      >
                        {session.sessionType === 'kuppi' ? 'Kuppi Class' : 'Study Together'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num font-semibold text-amber-700">{session.moduleCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{session.hostCampus}</span>
                      <span aria-hidden="true">·</span>
                      <span>{session.mode}</span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">{session.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {session.scheduleLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {session.locationOrLink}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono-num">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {session.attendeeIds.length}/{session.maxSeats}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono-num text-xs font-bold ${isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isFree ? 'FREE · LKR 0' : formatLkr(session.priceLkr)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenProfile({
                            uid: session.hostId,
                            displayName: session.hostName,
                            sliitStudentId: session.hostSliitId,
                            campus: session.hostCampus,
                            verifiedCampus: true,
                          })
                        }
                        className="text-xs font-medium text-slate-600 hover:text-[#0B1F3A] hover:underline cursor-pointer"
                      >
                        Host: {session.hostName}
                      </button>
                    </div>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (!currentUser) {
                          onOpenGate();
                          return;
                        }
                        void onToggleJoinKuppi(session.id);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer ${
                        isJoined
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-[#0B1F3A] text-white hover:bg-slate-800'
                      }`}
                    >
                      {isJoined ? 'Joined' : 'Join Session'}
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No active Kuppi or Study Together sessions listed for {campus} Campus yet.
            </p>
            <button
              type="button"
              onClick={onNavigateKuppi}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              Host First {campus} Session
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
