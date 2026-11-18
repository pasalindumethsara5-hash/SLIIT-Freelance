import {
  CAMPUS_BRANCHES,
  GIG_CATEGORIES,
  SLIIT_FACULTIES,
  type AchievementBadge,
  type CampusBranch,
  type CommissionSplit,
  type Gig,
  type GigCategory,
  type KuppiMode,
  type KuppiSession,
  type KuppiSessionType,
  type Order,
  type OrderStatus,
  type RevenueSummary,
  type SliitFaculty,
  type StudentProfileStats,
} from '../types/marketplace';

export const PLATFORM_FEE_RATE = 0.25 as const;
export const SELLER_SHARE_RATE = 0.75 as const;
export const MIN_GIG_PRICE_LKR = 500;
export const MAX_GIG_PRICE_LKR = 500_000;
export const FOUNDER_ADMIN_EMAIL = 'kalanamahisuru@gmail.com';

const SLIIT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/i;
const SLIIT_ID_REGEX = /^(IT|BM|EN|HS|AR|GS)[0-9]{8}$/i;

export function sanitizeTextInput(raw: string, maxLen = 1500): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function validateSliitEmail(email: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { valid: false, normalized, error: 'Enter your official SLIIT campus email address.' };
  }
  if (!SLIIT_EMAIL_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Access is restricted to SLIIT students. Use an @my.sliit.lk or @sliit.lk email.',
    };
  }
  return { valid: true, normalized };
}

export function validateSliitStudentId(studentId: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = studentId.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, normalized, error: 'Enter your SLIIT registration number (e.g. IT21849210).' };
  }
  if (!SLIIT_ID_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Invalid SLIIT ID format. Expected prefix IT, BM, EN, HS, AR, or GS followed by 8 digits.',
    };
  }
  return { valid: true, normalized };
}

export function calculateCommissionSplit(grossAmountLkr: number): CommissionSplit {
  if (!Number.isFinite(grossAmountLkr) || grossAmountLkr < 0) {
    throw new Error('Gross amount must be a non-negative finite number.');
  }
  const roundedGross = Math.round(grossAmountLkr);
  if (roundedGross === 0) {
    return {
      grossAmountLkr: 0,
      platformFeeRate: 0,
      sellerShareRate: 1,
      platformFeeLkr: 0,
      sellerPayoutLkr: 0,
    };
  }
  const platformFeeLkr = Math.round(roundedGross * PLATFORM_FEE_RATE);
  const sellerPayoutLkr = roundedGross - platformFeeLkr;

  return {
    grossAmountLkr: roundedGross,
    platformFeeRate: PLATFORM_FEE_RATE,
    sellerShareRate: SELLER_SHARE_RATE,
    platformFeeLkr,
    sellerPayoutLkr,
  };
}

export function calculateGrossFromDesiredPayout(desiredSellerPayoutLkr: number): CommissionSplit {
  if (!Number.isFinite(desiredSellerPayoutLkr) || desiredSellerPayoutLkr < 0) {
    throw new Error('Desired seller payout must be a non-negative finite number.');
  }
  if (Math.round(desiredSellerPayoutLkr) === 0) {
    return calculateCommissionSplit(0);
  }
  const grossAmountLkr = Math.round(desiredSellerPayoutLkr / SELLER_SHARE_RATE);
  return calculateCommissionSplit(grossAmountLkr);
}

export function formatLkr(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `LKR ${safe.toLocaleString('en-LK')}`;
}

export interface GigFilterOptions {
  query: string;
  category: GigCategory | 'All';
  campus: CampusBranch | 'All';
  pricingTier?: 'all' | 'free' | 'paid';
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'fastest';
}

export function filterGigs(gigs: Gig[], options: GigFilterOptions): Gig[] {
  const q = options.query.trim().toLowerCase();
  const tier = options.pricingTier ?? 'all';

  const filtered = gigs.filter((gig) => {
    if (gig.status !== 'active') return false;
    if (tier === 'free' && !gig.isFree && gig.priceLkr !== 0) return false;
    if (tier === 'paid' && (gig.isFree || gig.priceLkr === 0)) return false;
    if (options.category !== 'All' && gig.category !== options.category) return false;
    if (options.campus !== 'All' && gig.sellerCampus !== options.campus) return false;
    if (q) {
      const haystack = [
        gig.title,
        gig.description,
        gig.category,
        gig.sellerName,
        gig.sellerFaculty,
        gig.sellerCampus,
        gig.sellerSliitId,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case 'price_asc':
        return a.priceLkr - b.priceLkr;
      case 'price_desc':
        return b.priceLkr - a.priceLkr;
      case 'fastest':
        return a.deliveryDays - b.deliveryDays || b.rating - a.rating;
      case 'recommended':
      default:
        return b.rating * b.reviewCount - a.rating * a.reviewCount || b.createdAtMs - a.createdAtMs;
    }
  });
}

export interface GigValidationInput {
  title: string;
  description: string;
  category: string;
  isFree?: boolean;
  priceLkr: number;
  deliveryDays: number;
  revisions: number;
  deliverables: string[];
}

export function validateGigInput(input: GigValidationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const title = sanitizeTextInput(input.title, 120);
  if (title.length < 8 || title.length > 120) {
    errors.title = 'Service title must be between 8 and 120 characters.';
  }

  const description = sanitizeTextInput(input.description, 1500);
  if (description.length < 20 || description.length > 1500) {
    errors.description = 'Description must be between 20 and 1,500 characters.';
  }

  if (!(GIG_CATEGORIES as readonly string[]).includes(input.category)) {
    errors.category = 'Select a valid service category.';
  }

  const isFree = Boolean(input.isFree) || input.priceLkr === 0;
  if (isFree) {
    if (input.priceLkr !== 0) {
      errors.priceLkr = 'Free community listings must have price LKR 0.';
    }
  } else if (
    !Number.isFinite(input.priceLkr) ||
    input.priceLkr < MIN_GIG_PRICE_LKR ||
    input.priceLkr > MAX_GIG_PRICE_LKR
  ) {
    errors.priceLkr = `Paid price must be between LKR ${MIN_GIG_PRICE_LKR.toLocaleString()} and LKR ${MAX_GIG_PRICE_LKR.toLocaleString()}.`;
  }

  if (!Number.isFinite(input.deliveryDays) || input.deliveryDays < 1 || input.deliveryDays > 30) {
    errors.deliveryDays = 'Delivery time must be between 1 and 30 days.';
  }

  if (!Number.isFinite(input.revisions) || input.revisions < 0 || input.revisions > 10) {
    errors.revisions = 'Revisions must be between 0 and 10.';
  }

  const cleanDeliverables = input.deliverables.map((d) => sanitizeTextInput(d, 100)).filter(Boolean);
  if (cleanDeliverables.length === 0 || cleanDeliverables.length > 8) {
    errors.deliverables = 'Provide 1 to 8 deliverables.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface KuppiValidationInput {
  sessionType: KuppiSessionType;
  moduleCode: string;
  title: string;
  topicSummary: string;
  mode: KuppiMode;
  locationOrLink: string;
  scheduleLabel: string;
  priceLkr: number;
  maxSeats: number;
}

export function validateKuppiInput(input: KuppiValidationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (input.sessionType !== 'kuppi' && input.sessionType !== 'study_group') {
    errors.sessionType = 'Select Kuppi Session or Study Together Group.';
  }
  const moduleCode = sanitizeTextInput(input.moduleCode, 16);
  if (moduleCode.length < 3) {
    errors.moduleCode = 'Enter a module code (e.g. IT2070 or EN1020).';
  }
  const title = sanitizeTextInput(input.title, 120);
  if (title.length < 6) {
    errors.title = 'Session title must be at least 6 characters.';
  }
  const topicSummary = sanitizeTextInput(input.topicSummary, 800);
  if (topicSummary.length < 10) {
    errors.topicSummary = 'Describe the topics or study agenda (min 10 characters).';
  }
  const locationOrLink = sanitizeTextInput(input.locationOrLink, 140);
  if (locationOrLink.length < 3) {
    errors.locationOrLink = 'Enter a campus hall/library spot or online meeting link.';
  }
  const scheduleLabel = sanitizeTextInput(input.scheduleLabel, 80);
  if (scheduleLabel.length < 4) {
    errors.scheduleLabel = 'Provide date and time (e.g. Thu 6:30 PM).';
  }
  if (!Number.isFinite(input.maxSeats) || input.maxSeats < 2 || input.maxSeats > 100) {
    errors.maxSeats = 'Seats must be between 2 and 100.';
  }
  if (input.sessionType === 'study_group' && input.priceLkr !== 0) {
    errors.priceLkr = 'Study Together groups are always free (LKR 0).';
  } else if (
    input.priceLkr !== 0 &&
    (!Number.isFinite(input.priceLkr) || input.priceLkr < MIN_GIG_PRICE_LKR || input.priceLkr > MAX_GIG_PRICE_LKR)
  ) {
    errors.priceLkr = `Ticket price must be LKR 0 (Free) or LKR ${MIN_GIG_PRICE_LKR.toLocaleString()}–${MAX_GIG_PRICE_LKR.toLocaleString()}.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function filterKuppiSessions(
  sessions: KuppiSession[],
  options: { query: string; sessionType: KuppiSessionType | 'all'; campus: CampusBranch | 'All' }
): KuppiSession[] {
  const q = options.query.trim().toLowerCase();
  return sessions.filter((s) => {
    if (options.sessionType !== 'all' && s.sessionType !== options.sessionType) return false;
    if (options.campus !== 'All' && s.hostCampus !== options.campus) return false;
    if (q) {
      const hay = [s.title, s.moduleCode, s.topicSummary, s.hostName, s.hostCampus, s.locationOrLink]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function formatKuppiInviteText(session: KuppiSession): string {
  const kind = session.sessionType === 'kuppi' ? 'SLIIT Kuppi Class' : 'SLIIT Study Together';
  const fee = session.priceLkr === 0 ? 'FREE' : formatLkr(session.priceLkr);
  return `${kind}: [${session.moduleCode}] ${session.title} | ${session.mode} (${session.hostCampus}) at ${session.locationOrLink} | ${session.scheduleLabel} | Entry: ${fee} | Hosted by ${session.hostName} (${session.hostSliitId}) on SLIIT Freelance Hub`;
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  actorRole: 'buyer' | 'seller' | 'admin'
): boolean {
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return false;
  }
  if (actorRole === 'admin') {
    return currentStatus !== nextStatus;
  }
  if (actorRole === 'seller') {
    return currentStatus === 'in_progress' && nextStatus === 'delivered';
  }
  if (actorRole === 'buyer') {
    if (currentStatus === 'delivered' && nextStatus === 'completed') return true;
    if (currentStatus === 'in_progress' && nextStatus === 'cancelled') return true;
  }
  return false;
}

export function summarizePlatformRevenue(orders: Order[]): RevenueSummary {
  let completedOrdersCount = 0;
  let pendingEscrowCount = 0;
  let cancelledOrdersCount = 0;
  let realizedGrossLkr = 0;
  let realizedPlatformFeeLkr = 0;
  let realizedSellerPayoutLkr = 0;
  let pendingGrossLkr = 0;
  let pendingPlatformFeeLkr = 0;
  let pendingSellerPayoutLkr = 0;

  const campusMap = new Map<CampusBranch, { orderCount: number; grossLkr: number; platformFeeLkr: number }>();
  for (const branch of CAMPUS_BRANCHES) {
    campusMap.set(branch, { orderCount: 0, grossLkr: 0, platformFeeLkr: 0 });
  }

  const categoryMap = new Map<GigCategory, { orderCount: number; grossLkr: number; platformFeeLkr: number }>();
  for (const cat of GIG_CATEGORIES) {
    categoryMap.set(cat, { orderCount: 0, grossLkr: 0, platformFeeLkr: 0 });
  }

  for (const order of orders) {
    if (order.status === 'cancelled') {
      cancelledOrdersCount += 1;
      continue;
    }

    if (order.status === 'completed') {
      completedOrdersCount += 1;
      realizedGrossLkr += order.grossAmountLkr;
      realizedPlatformFeeLkr += order.platformFeeLkr;
      realizedSellerPayoutLkr += order.sellerPayoutLkr;
    } else {
      pendingEscrowCount += 1;
      pendingGrossLkr += order.grossAmountLkr;
      pendingPlatformFeeLkr += order.platformFeeLkr;
      pendingSellerPayoutLkr += order.sellerPayoutLkr;
    }

    const campusStat = campusMap.get(order.sellerCampus);
    if (campusStat) {
      campusStat.orderCount += 1;
      campusStat.grossLkr += order.grossAmountLkr;
      campusStat.platformFeeLkr += order.platformFeeLkr;
    }

    const catStat = categoryMap.get(order.category);
    if (catStat) {
      catStat.orderCount += 1;
      catStat.grossLkr += order.grossAmountLkr;
      catStat.platformFeeLkr += order.platformFeeLkr;
    }
  }

  return {
    totalOrdersCount: orders.length,
    completedOrdersCount,
    pendingEscrowCount,
    cancelledOrdersCount,
    realizedGrossLkr,
    realizedPlatformFeeLkr,
    realizedSellerPayoutLkr,
    pendingGrossLkr,
    pendingPlatformFeeLkr,
    pendingSellerPayoutLkr,
    byCampus: CAMPUS_BRANCHES.map((campus) => ({
      campus,
      ...(campusMap.get(campus) ?? { orderCount: 0, grossLkr: 0, platformFeeLkr: 0 }),
    })).sort((a, b) => b.platformFeeLkr - a.platformFeeLkr),
    byCategory: GIG_CATEGORIES.map((category) => ({
      category,
      ...(categoryMap.get(category) ?? { orderCount: 0, grossLkr: 0, platformFeeLkr: 0 }),
    })).sort((a, b) => b.platformFeeLkr - a.platformFeeLkr),
  };
}

export function isValidCampusBranch(val: string): val is CampusBranch {
  return (CAMPUS_BRANCHES as readonly string[]).includes(val);
}

export function isValidSliitFaculty(val: string): val is SliitFaculty {
  return (SLIIT_FACULTIES as readonly string[]).includes(val);
}

export interface StudentIdentitySeed {
  uid: string;
  displayName: string;
  sliitStudentId?: string;
  campus?: CampusBranch;
  faculty?: SliitFaculty;
  verifiedCampus?: boolean;
}

export function computeStudentProfileStats(
  identity: StudentIdentitySeed,
  gigs: Gig[],
  orders: Order[],
  kuppiSessions: KuppiSession[]
): StudentProfileStats {
  const sellerGigs = gigs.filter((g) => g.sellerId === identity.uid && g.status === 'active');
  const completedSellerOrders = orders.filter(
    (o) => o.sellerId === identity.uid && o.status === 'completed'
  ).length;
  const completedBuyerOrders = orders.filter(
    (o) => o.buyerId === identity.uid && o.status === 'completed'
  ).length;
  const totalCompletedOrders = completedSellerOrders + completedBuyerOrders;

  let weightedRatingSum = 0;
  let totalReviews = 0;
  for (const g of sellerGigs) {
    if (g.reviewCount > 0) {
      weightedRatingSum += g.rating * g.reviewCount;
      totalReviews += g.reviewCount;
    }
  }
  const avgSellerRating = totalReviews > 0 ? Number((weightedRatingSum / totalReviews).toFixed(2)) : 0;
  const freeServicesCount = sellerGigs.filter((g) => g.isFree || g.priceLkr === 0).length;

  const kuppiHostedCount = kuppiSessions.filter((s) => s.hostId === identity.uid).length;
  const kuppiAttendedCount = kuppiSessions.filter((s) => s.attendeeIds.includes(identity.uid)).length;
  const totalKuppiActivity = kuppiHostedCount + kuppiAttendedCount;

  const topRatedEarned =
    (totalReviews >= 10 && avgSellerRating >= 4.8) ||
    (completedSellerOrders >= 1 && (avgSellerRating >= 4.8 || totalReviews === 0)) ||
    completedSellerOrders >= 3;
  const kuppiMasterEarned = kuppiHostedCount >= 1 || kuppiAttendedCount >= 2;
  const verifiedCloserEarned = totalCompletedOrders >= 1;
  const studyStreakEarned = kuppiAttendedCount >= 1 || kuppiHostedCount >= 1;
  const freeMentorEarned = freeServicesCount >= 1;
  const campusVerifiedEarned = identity.verifiedCampus !== false;

  const badges: AchievementBadge[] = [
    {
      id: 'top_rated_seller',
      label: 'Top Rated Seller',
      description: 'Maintain ★ 4.8+ rating across 10+ reviews or deliver top-rated campus orders.',
      tier: 'gold',
      earned: topRatedEarned,
      progressLabel: topRatedEarned
        ? totalReviews > 0
          ? `★ ${avgSellerRating.toFixed(1)} (${totalReviews} reviews)`
          : `${completedSellerOrders} seller ${completedSellerOrders === 1 ? 'order' : 'orders'}`
        : `${totalReviews} / 10 reviews or 1 completed sale`,
    },
    {
      id: 'kuppi_master',
      label: 'Kuppi Master',
      description: 'Host a Kuppi / Study Together session or attend 2+ peer learning sessions.',
      tier: 'navy',
      earned: kuppiMasterEarned,
      progressLabel: kuppiHostedCount >= 1
        ? `Hosted ${kuppiHostedCount} ${kuppiHostedCount === 1 ? 'session' : 'sessions'}`
        : kuppiAttendedCount >= 2
        ? `Attended ${kuppiAttendedCount} sessions`
        : `${totalKuppiActivity} / 2 attended (or host 1)`,
    },
    {
      id: 'verified_closer',
      label: 'Verified Closer',
      description: 'Successfully complete campus freelance orders through escrow release.',
      tier: 'emerald',
      earned: verifiedCloserEarned,
      progressLabel: verifiedCloserEarned
        ? `${totalCompletedOrders} completed ${totalCompletedOrders === 1 ? 'order' : 'orders'}`
        : '0 / 1 completed order',
    },
    {
      id: 'study_streak',
      label: 'Study Streak',
      description: 'Reserve a seat and join a live SLIIT Kuppi or Study Together session.',
      tier: 'sky',
      earned: studyStreakEarned,
      progressLabel: studyStreakEarned
        ? `${Math.max(kuppiAttendedCount, kuppiHostedCount)} active ${
            Math.max(kuppiAttendedCount, kuppiHostedCount) === 1 ? 'session' : 'sessions'
          }`
        : '0 / 1 session joined',
    },
    {
      id: 'free_mentor',
      label: 'Free Peer Mentor',
      description: 'Publish a zero-cost (LKR 0) peer help service for SLIIT students.',
      tier: 'emerald',
      earned: freeMentorEarned,
      progressLabel: freeMentorEarned
        ? `${freeServicesCount} free ${freeServicesCount === 1 ? 'service' : 'services'}`
        : 'Publish 1 Free Peer Help gig',
    },
    {
      id: 'campus_verified',
      label: 'SLIIT Verified',
      description: 'Authenticated @my.sliit.lk student identity on SLIIT Freelance Hub.',
      tier: 'navy',
      earned: campusVerifiedEarned,
      progressLabel: identity.sliitStudentId ? `${identity.sliitStudentId} · Verified` : 'Campus ID verified',
    },
  ];

  const fallbackGig = sellerGigs[0];
  const fallbackKuppi = kuppiSessions.find((s) => s.hostId === identity.uid);

  return {
    uid: identity.uid,
    displayName: identity.displayName || fallbackGig?.sellerName || fallbackKuppi?.hostName || 'SLIIT Student',
    sliitStudentId: identity.sliitStudentId || fallbackGig?.sellerSliitId || fallbackKuppi?.hostSliitId,
    campus: identity.campus || fallbackGig?.sellerCampus || fallbackKuppi?.hostCampus,
    faculty: identity.faculty || fallbackGig?.sellerFaculty,
    completedSellerOrders,
    completedBuyerOrders,
    totalCompletedOrders,
    avgSellerRating,
    totalReviews,
    kuppiHostedCount,
    kuppiAttendedCount,
    freeServicesCount,
    badges,
    earnedBadges: badges.filter((b) => b.earned),
  };
}

