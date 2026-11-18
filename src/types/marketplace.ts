export const CAMPUS_BRANCHES = [
  'Malabe',
  'Metro',
  'Matara',
  'Kandy',
  'Kurunegala',
  'Jaffna',
] as const;

export type CampusBranch = (typeof CAMPUS_BRANCHES)[number];

export const SLIIT_FACULTIES = [
  'Computing',
  'Engineering',
  'Business',
  'Humanities & Sciences',
  'Architecture',
] as const;

export type SliitFaculty = (typeof SLIIT_FACULTIES)[number];

export const GIG_CATEGORIES = [
  'Software & Web',
  'UI/UX & Figma',
  'Data & AI',
  'Academic & LaTeX',
  'Video & Motion',
  'Business & Decks',
  'Free Peer Help',
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number];

export type OrderStatus = 'in_progress' | 'delivered' | 'completed' | 'cancelled';

export type KuppiSessionType = 'kuppi' | 'study_group';
export type KuppiMode = 'On-Campus' | 'Online';
export type KuppiStatus = 'open' | 'full' | 'completed';

export interface UserProfile {
  uid: string;
  displayName: string;
  sliitEmail: string;
  sliitStudentId: string;
  campus: CampusBranch;
  faculty: SliitFaculty;
  batch: string;
  role: 'student';
  verifiedCampus: boolean;
  isFounderAdmin?: boolean;
  createdAtMs: number;
}

export interface Gig {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerSliitId: string;
  sellerCampus: CampusBranch;
  sellerFaculty: SliitFaculty;
  title: string;
  description: string;
  category: GigCategory;
  isFree: boolean;
  priceLkr: number;
  platformFeeLkr: number;
  sellerPayoutLkr: number;
  deliveryDays: number;
  revisions: number;
  deliverables: string[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'paused';
  createdAtMs: number;
}

export interface Order {
  id: string;
  gigId: string;
  gigTitle: string;
  category: GigCategory;
  buyerId: string;
  buyerName: string;
  buyerCampus: CampusBranch;
  sellerId: string;
  sellerName: string;
  sellerCampus: CampusBranch;
  grossAmountLkr: number;
  platformFeeRate: 0.25 | 0;
  platformFeeLkr: number;
  sellerPayoutLkr: number;
  requirements: string;
  deliveryNote: string;
  status: OrderStatus;
  rating?: number;
  feedback?: string;
  reviewedAtMs?: number;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface KuppiSession {
  id: string;
  hostId: string;
  hostName: string;
  hostSliitId: string;
  hostCampus: CampusBranch;
  sessionType: KuppiSessionType;
  moduleCode: string;
  title: string;
  topicSummary: string;
  mode: KuppiMode;
  locationOrLink: string;
  scheduleLabel: string;
  priceLkr: number;
  platformFeeLkr: number;
  sellerPayoutLkr: number;
  maxSeats: number;
  attendeeIds: string[];
  status: KuppiStatus;
  createdAtMs: number;
}

export interface CommissionSplit {
  grossAmountLkr: number;
  platformFeeRate: 0.25 | 0;
  sellerShareRate: 0.75 | 1;
  platformFeeLkr: number;
  sellerPayoutLkr: number;
}

export interface RevenueSummary {
  totalOrdersCount: number;
  completedOrdersCount: number;
  pendingEscrowCount: number;
  cancelledOrdersCount: number;
  realizedGrossLkr: number;
  realizedPlatformFeeLkr: number;
  realizedSellerPayoutLkr: number;
  pendingGrossLkr: number;
  pendingPlatformFeeLkr: number;
  pendingSellerPayoutLkr: number;
  byCampus: Array<{
    campus: CampusBranch;
    orderCount: number;
    grossLkr: number;
    platformFeeLkr: number;
  }>;
  byCategory: Array<{
    category: GigCategory;
    orderCount: number;
    grossLkr: number;
    platformFeeLkr: number;
  }>;
}

export type AchievementBadgeId =
  | 'top_rated_seller'
  | 'kuppi_master'
  | 'verified_closer'
  | 'study_streak'
  | 'free_mentor'
  | 'campus_verified';

export interface AchievementBadge {
  id: AchievementBadgeId;
  label: string;
  description: string;
  tier: 'gold' | 'navy' | 'emerald' | 'sky';
  earned: boolean;
  progressLabel: string;
}

export interface StudentProfileStats {
  uid: string;
  displayName: string;
  sliitStudentId?: string;
  campus?: CampusBranch;
  faculty?: SliitFaculty;
  completedSellerOrders: number;
  completedBuyerOrders: number;
  totalCompletedOrders: number;
  avgSellerRating: number;
  totalReviews: number;
  kuppiHostedCount: number;
  kuppiAttendedCount: number;
  freeServicesCount: number;
  badges: AchievementBadge[];
  earnedBadges: AchievementBadge[];
}

