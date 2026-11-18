import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Copy,
  FileText,
  Landmark,
  Lock,
  MapPin,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CAMPUS_BRANCHES,
  OFFICIAL_CAMPUS_BANK_DETAILS,
  type AchievementBadge,
  type CampusBranch,
  type Gig,
  type KuppiMode,
  type KuppiSession,
  type KuppiSessionType,
  type Order,
  type StudentProfileStats,
  type UserProfile,
} from '../types/marketplace';
import {
  calculateCommissionSplit,
  computeStudentProfileStats,
  filterKuppiSessions,
  formatKuppiInviteText,
  formatLkr,
  sanitizeTextInput,
  validateKuppiInput,
  type StudentIdentitySeed,
} from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface KuppiStudyViewProps {
  sessions: KuppiSession[];
  gigs: Gig[];
  orders: Order[];
  currentUser: UserProfile | null;
  campusFilter: CampusBranch | 'All';
  onCampusChange: (campus: CampusBranch | 'All') => void;
  onOpenGate: () => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
  onCreateSession: (session: Omit<KuppiSession, 'id' | 'createdAtMs'>) => Promise<void>;
  onToggleJoin: (sessionId: string) => Promise<void>;
}

const HOST_BADGE_PRIORITY: AchievementBadge['id'][] = [
  'kuppi_master',
  'top_rated_seller',
  'free_mentor',
  'study_streak',
  'verified_closer',
  'campus_verified',
];

function getHostFeaturedBadge(stats: StudentProfileStats): AchievementBadge | undefined {
  for (const id of HOST_BADGE_PRIORITY) {
    const match = stats.earnedBadges.find((b) => b.id === id);
    if (match) return match;
  }
  return stats.earnedBadges[0];
}

export function KuppiStudyView({
  sessions,
  gigs,
  orders,
  currentUser,
  campusFilter,
  onCampusChange,
  onOpenGate,
  onOpenProfile,
  onCreateSession,
  onToggleJoin,
}: KuppiStudyViewProps) {
  const [query, setQuery] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<KuppiSessionType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHostForm, setShowHostForm] = useState(false);

  // Host form state
  const [sessionType, setSessionType] = useState<KuppiSessionType>('study_group');
  const [moduleCode, setModuleCode] = useState('');
  const [title, setTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [mode, setMode] = useState<KuppiMode>('On-Campus');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [scheduleLabel, setScheduleLabel] = useState('');
  const [priceLkr, setPriceLkr] = useState<number>(0);
  const [maxSeats, setMaxSeats] = useState<number>(20);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Paid Kuppi Checkout Modal State
  const [selectedPaidSession, setSelectedPaidSession] = useState<KuppiSession | null>(null);
  const [kuppiReceiptUrl, setKuppiReceiptUrl] = useState<string | null>(null);
  const [kuppiReceiptName, setKuppiReceiptName] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmingTicket, setConfirmingTicket] = useState(false);
  const [copiedBankKuppi, setCopiedBankKuppi] = useState(false);

  const handleKuppiReceiptUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setCheckoutError('Receipt file size must be less than 5MB.');
      return;
    }

    setKuppiReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setKuppiReceiptUrl(reader.result);
        setCheckoutError(null);
      }
    };
    reader.onerror = () => {
      setCheckoutError('Failed to read the receipt file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPaidTicket = async () => {
    if (!selectedPaidSession) return;
    if (!kuppiReceiptUrl) {
      setCheckoutError('Please upload your bank transfer payment slip to verify and confirm your seat.');
      return;
    }
    setConfirmingTicket(true);
    try {
      await onToggleJoin(selectedPaidSession.id);
      setSelectedPaidSession(null);
      setKuppiReceiptUrl(null);
      setKuppiReceiptName(null);
      setCheckoutError(null);
    } finally {
      setConfirmingTicket(false);
    }
  };

  const visibleSessions = filterKuppiSessions(sessions, {
    query,
    sessionType: sessionTypeFilter,
    campus: campusFilter,
  });

  const effectivePrice = sessionType === 'study_group' ? 0 : Number.isFinite(priceLkr) ? Math.max(0, priceLkr) : 0;
  const split = calculateCommissionSplit(effectivePrice);

  const handleCopyInvite = async (session: KuppiSession) => {
    const inviteText = formatKuppiInviteText(session);
    try {
      await navigator.clipboard.writeText(inviteText);
    } catch {
      // Clipboard API fallback when headless or restricted
    }
    setCopiedId(session.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === session.id ? null : prev));
    }, 2500);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenGate();
      return;
    }

    const cleanModule = sanitizeTextInput(moduleCode, 16).toUpperCase();
    const cleanTitle = sanitizeTextInput(title, 120);
    const cleanSummary = sanitizeTextInput(topicSummary, 800);
    const cleanLocation = sanitizeTextInput(locationOrLink, 140);
    const cleanSchedule = sanitizeTextInput(scheduleLabel, 80);

    const validation = validateKuppiInput({
      sessionType,
      moduleCode: cleanModule,
      title: cleanTitle,
      topicSummary: cleanSummary,
      mode,
      locationOrLink: cleanLocation,
      scheduleLabel: cleanSchedule,
      priceLkr: effectivePrice,
      maxSeats,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onCreateSession({
        hostId: currentUser.uid,
        hostName: currentUser.displayName,
        hostSliitId: currentUser.sliitStudentId,
        hostCampus: currentUser.campus,
        sessionType,
        moduleCode: cleanModule,
        title: cleanTitle,
        topicSummary: cleanSummary,
        mode,
        locationOrLink: cleanLocation,
        scheduleLabel: cleanSchedule,
        priceLkr: split.grossAmountLkr,
        platformFeeLkr: split.platformFeeLkr,
        sellerPayoutLkr: split.sellerPayoutLkr,
        maxSeats,
        attendeeIds: [currentUser.uid],
        status: 'open',
      });
      setModuleCode('');
      setTitle('');
      setTopicSummary('');
      setLocationOrLink('');
      setScheduleLabel('');
      setPriceLkr(0);
      setShowHostForm(false);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Unable to host session.' });
    } finally {
      setSubmitting(false);
    }
  };

  const myStats = currentUser
    ? computeStudentProfileStats(
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
        sessions
      )
    : null;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Glass Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-amber-700 tracking-wide">
            SLIIT Peer Learning · Kuppi &amp; Study Together
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#0B1F3A]">
            Join Kuppi Classes &amp; Invite Peers to Study Together
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Reserve a seat in student-led Kuppi revision sessions (free or paid with 25% hub split), or host an open
            library/online Study Together group and copy an instant invite for your SLIIT batchmates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onOpenGate();
              return;
            }
            setShowHostForm((prev) => !prev);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showHostForm ? 'Close Host Form' : 'Host Kuppi or Study Group'}
        </button>
      </div>

      {/* Signed-in Student Kuppi & Attendance Badges Strip */}
      {currentUser && myStats && (
        <div
          data-testid="my-kuppi-badges"
          className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Your Kuppi &amp; Study Attendance Badges</span>
            </div>
            <div className="font-mono-num text-xs text-slate-600">
              {myStats.kuppiAttendedCount} sessions attended · {myStats.kuppiHostedCount} hosted ·{' '}
              {myStats.earnedBadges.length}/{myStats.badges.length} badges unlocked
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {myStats.badges
              .filter((b) => b.id === 'kuppi_master' || b.id === 'study_streak')
              .map((badge) => (
                <AchievementBadgeChip key={badge.id} badge={badge} variant="compact" />
              ))}
            <button
              type="button"
              onClick={() =>
                onOpenProfile({
                  uid: currentUser.uid,
                  displayName: currentUser.displayName,
                  sliitStudentId: currentUser.sliitStudentId,
                  campus: currentUser.campus,
                  faculty: currentUser.faculty,
                  verifiedCampus: currentUser.verifiedCampus,
                })
              }
              className="px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] bg-white/80 border border-slate-200 hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Profile &amp; Badges
            </button>
          </div>
        </div>
      )}

      {/* Expandable Host Form */}
      <AnimatePresence>
        {showHostForm && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleCreate}
            className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5"
          >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0B1F3A]">Host a Campus Session</h2>
              <p className="text-xs text-slate-600">
                Choose a Free Study Together room or a Kuppi revision class (free or paid).
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70">
              <button
                type="button"
                onClick={() => {
                  setSessionType('study_group');
                  setPriceLkr(0);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  sessionType === 'study_group' ? 'bg-emerald-700 text-white' : 'text-slate-700'
                }`}
              >
                Study Together (Free)
              </button>
              <button
                type="button"
                onClick={() => setSessionType('kuppi')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  sessionType === 'kuppi' ? 'bg-[#0B1F3A] text-white' : 'text-slate-700'
                }`}
              >
                Kuppi Class
              </button>
            </div>
          </div>

          {errors.form && (
            <div role="alert" className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="kuppi-module" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Module Code
              </label>
              <input
                id="kuppi-module"
                type="text"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                placeholder="IT2070"
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.moduleCode && <p className="mt-1 text-xs text-red-600">{errors.moduleCode}</p>}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="kuppi-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Session Title
              </label>
              <input
                id="kuppi-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DSA Graphs & Dynamic Programming Midterm Kuppi"
                className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="kuppi-summary" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topics Covered &amp; Study Plan
            </label>
            <textarea
              id="kuppi-summary"
              rows={3}
              value={topicSummary}
              onChange={(e) => setTopicSummary(e.target.value)}
              placeholder="Explain what past papers, coding labs, or chapters will be covered..."
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            {errors.topicSummary && <p className="mt-1 text-xs text-red-600">{errors.topicSummary}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="kuppi-mode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Format
              </label>
              <select
                id="kuppi-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as KuppiMode)}
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              >
                <option value="On-Campus">On-Campus Hall / Library</option>
                <option value="Online">Online (Teams / Zoom)</option>
              </select>
            </div>

            <div>
              <label htmlFor="kuppi-location" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hall or Meeting Link
              </label>
              <input
                id="kuppi-location"
                type="text"
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                placeholder="Malabe Library Floor 3"
                className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.locationOrLink && <p className="mt-1 text-xs text-red-600">{errors.locationOrLink}</p>}
            </div>

            <div>
              <label htmlFor="kuppi-schedule" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date &amp; Time
              </label>
              <input
                id="kuppi-schedule"
                type="text"
                value={scheduleLabel}
                onChange={(e) => setScheduleLabel(e.target.value)}
                placeholder="Thu 6:30 PM – 8:30 PM"
                className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.scheduleLabel && <p className="mt-1 text-xs text-red-600">{errors.scheduleLabel}</p>}
            </div>

            <div>
              <label htmlFor="kuppi-seats" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Seats
              </label>
              <input
                id="kuppi-seats"
                type="number"
                min={2}
                max={100}
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              {errors.maxSeats && <p className="mt-1 text-xs text-red-600">{errors.maxSeats}</p>}
            </div>
          </div>

          {sessionType === 'kuppi' && (
            <div className="glass-subtle rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-xs">
                <label htmlFor="kuppi-price" className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Price (LKR 0 for Free, or 500+)
                </label>
                <input
                  id="kuppi-price"
                  type="number"
                  min={0}
                  max={500000}
                  step={100}
                  value={priceLkr}
                  onChange={(e) => setPriceLkr(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm font-mono-num glass-input rounded-xl"
                />
                {errors.priceLkr && <p className="mt-1 text-xs text-red-600">{errors.priceLkr}</p>}
              </div>
              <div className="text-xs text-slate-600 font-mono-num space-y-1">
                <div>
                  Entry: <strong className="text-slate-900">{effectivePrice === 0 ? 'FREE (LKR 0)' : formatLkr(split.grossAmountLkr)}</strong>
                </div>
                <div>
                  Platform 25%: <strong className="text-amber-700">{formatLkr(split.platformFeeLkr)}</strong> · Tutor 75%:{' '}
                  <strong className="text-emerald-700">{formatLkr(split.sellerPayoutLkr)}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {submitting ? 'Publishing Session...' : 'Publish Kuppi / Study Session'}
            </button>
          </div>
        </motion.form>
        )}
      </AnimatePresence>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="kuppi-search" className="sr-only">
            Search Kuppi and Study Together sessions
          </label>
          <input
            id="kuppi-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search IT2070, DBMS, Malabe Library, Engineering Maths..."
            className="w-full pl-10 pr-4 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70">
            {(
              [
                { id: 'all', label: 'All Sessions' },
                { id: 'kuppi', label: 'Kuppi Classes' },
                { id: 'study_group', label: 'Study Together' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSessionTypeFilter(t.id)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  sessionTypeFilter === t.id ? 'text-[#0B1F3A]' : 'text-slate-600'
                }`}
              >
                {sessionTypeFilter === t.id && (
                  <motion.span
                    layoutId="kuppi-type-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <select
            aria-label="Filter Kuppi sessions by campus"
            value={campusFilter}
            onChange={(e) => onCampusChange(e.target.value as CampusBranch | 'All')}
            className="px-3.5 py-2.5 text-sm glass-input rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          >
            <option value="All">All Campuses</option>
            {CAMPUS_BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch} Campus
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {visibleSessions.length > 0 ? (
        <div data-testid="kuppi-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleSessions.map((session, idx) => {
            const isJoined = Boolean(currentUser && session.attendeeIds.includes(currentUser.uid));
            const isFull = session.attendeeIds.length >= session.maxSeats && !isJoined;
            const isFree = session.priceLkr === 0;
            const hostIdentity: StudentIdentitySeed = {
              uid: session.hostId,
              displayName: session.hostName,
              sliitStudentId: session.hostSliitId,
              campus: session.hostCampus,
              verifiedCampus: true,
            };
            const hostStats = computeStudentProfileStats(hostIdentity, gigs, orders, sessions);
            const hostBadge = getHostFeaturedBadge(hostStats);

            return (
              <motion.article
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-5 transition-shadow hover:shadow-xl"
              >
                <div className="space-y-3">
                  {/* Unboxed metadata with dot separators + host badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
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
                    {hostBadge && <AchievementBadgeChip badge={hostBadge} variant="compact" />}
                    {isJoined && !isFree && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" /> Ticket Active
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">{session.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{session.topicSummary}</p>

                  <div className="glass-subtle rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{session.scheduleLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {isFree || isJoined ? (
                          <span className={isJoined && !isFree ? 'font-semibold text-emerald-800' : ''}>
                            {session.locationOrLink}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Book seat &amp; verify slip to unlock link
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <button
                        type="button"
                        onClick={() => onOpenProfile(hostIdentity)}
                        aria-label={`View host achievement profile for ${session.hostName}`}
                        className="truncate text-left font-medium text-slate-800 hover:text-[#0B1F3A] hover:underline cursor-pointer"
                      >
                        Host: {session.hostName} ({session.hostSliitId})
                      </button>
                    </div>
                    <div className="flex items-center gap-2 font-mono-num">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {session.attendeeIds.length} / {session.maxSeats} seats filled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900/10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500">
                      {isFree ? 'Open Campus Session' : 'Ticket (25% Hub / 75% Tutor)'}
                    </div>
                    <div className={`font-mono-num text-sm font-bold ${isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isFree ? 'FREE · LKR 0' : formatLkr(session.priceLkr)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopyInvite(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedId === session.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          Invite Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Invite
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isFull && !isJoined}
                      onClick={() => {
                        if (!currentUser) {
                          onOpenGate();
                          return;
                        }
                        if (session.priceLkr > 0 && !isJoined) {
                          setSelectedPaidSession(session);
                          setKuppiReceiptUrl(null);
                          setKuppiReceiptName(null);
                          setCheckoutError(null);
                          return;
                        }
                        void onToggleJoin(session.id);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                        isJoined
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : session.priceLkr > 0
                          ? 'bg-[#0B1F3A] text-white hover:bg-slate-800 shadow-sm'
                          : 'bg-[#0B1F3A] text-white hover:bg-slate-800'
                      }`}
                    >
                      {isJoined
                        ? 'Joined · Leave Seat'
                        : isFull
                        ? 'Session Full'
                        : session.priceLkr > 0
                        ? `Book Seat · ${formatLkr(session.priceLkr)}`
                        : 'Join Free Session'}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <h3 className="font-display text-lg font-semibold text-slate-900">No Kuppi or Study sessions match</h3>
          <p className="mt-2 text-sm text-slate-600">
            Clear your filters or click &ldquo;Host Kuppi or Study Group&rdquo; to invite fellow SLIIT students.
          </p>
        </div>
      )}

      {/* Paid Kuppi Ticket Booking & Bank Slip Upload Modal */}
      <AnimatePresence>
        {selectedPaidSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kuppi-checkout-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !confirmingTicket) setSelectedPaidSession(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="glass-panel bg-white/95 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="kuppi-checkout-title" className="font-display text-sm font-bold text-slate-900">
                      Book Kuppi Masterclass Ticket
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedPaidSession.moduleCode} · {selectedPaidSession.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={confirmingTicket}
                  onClick={() => setSelectedPaidSession(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price & Split Info */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Ticket Price:</span>
                  <span className="font-mono-num text-lg font-bold text-slate-900">
                    {formatLkr(selectedPaidSession.priceLkr)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Host Tutor (75%): {formatLkr(calculateCommissionSplit(selectedPaidSession.priceLkr).sellerPayoutLkr)}</span>
                  <span>Platform Escrow (25%): {formatLkr(calculateCommissionSplit(selectedPaidSession.priceLkr).platformFeeLkr)}</span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wide">
                    <Landmark className="w-3.5 h-3.5 text-amber-700" />
                    <span>Campus Escrow Bank Details</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Transfer <span className="font-bold font-mono-num">{formatLkr(selectedPaidSession.priceLkr)}</span> via online banking or CDM, then upload your transfer slip:
                </p>

                <div className="bg-white/95 rounded-xl p-3 border border-amber-200/60 text-xs space-y-1.5">
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
                          setCopiedBankKuppi(true);
                          setTimeout(() => setCopiedBankKuppi(false), 2000);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedBankKuppi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-semibold text-slate-800">{OFFICIAL_CAMPUS_BANK_DETAILS.branch}</span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload Bank Transfer Receipt Slip <span className="text-red-500">*</span>
                </label>

                {kuppiReceiptUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {kuppiReceiptUrl.startsWith('data:image/') ? (
                        <img
                          src={kuppiReceiptUrl}
                          alt="Receipt slip"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {kuppiReceiptName || 'payment_slip.png'}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Slip attached &amp; ready
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setKuppiReceiptUrl(null);
                        setKuppiReceiptName(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove receipt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors group">
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
                      onChange={handleKuppiReceiptUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {checkoutError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                  {checkoutError}
                </div>
              )}

              {/* Confirm / Cancel Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={confirmingTicket}
                  onClick={() => void handleConfirmPaidTicket()}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  {confirmingTicket
                    ? 'Verifying & Reserving Seat...'
                    : kuppiReceiptUrl
                    ? `Upload Receipt & Confirm Ticket (${formatLkr(selectedPaidSession.priceLkr)})`
                    : `Pay & Upload Receipt (${formatLkr(selectedPaidSession.priceLkr)})`}
                </button>

                <button
                  type="button"
                  disabled={confirmingTicket}
                  onClick={() => setSelectedPaidSession(null)}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
