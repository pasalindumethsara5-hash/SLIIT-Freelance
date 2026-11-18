# SLIIT Freelance Hub — Complete UI Bundle (Antigravity Ready)

## How to Import into Antigravity
1. Copy or download this file (`sliit_hub_ui_bundle.md`) into an empty folder opened in **Antigravity**.
2. Tell Antigravity:
   > *"Create every file listed in `sliit_hub_ui_bundle.md` with its exact path and code, stub Firebase if `firebase-applet-config.json` is not present, then run `npm install && npm run dev`."*
3. (Optional) Place the image assets in `src/assets/images/` and `public/assets/aistudio/` (or download them from the live app URL).

---

## File: `package.json`

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "node server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@firebase/eslint-plugin-security-rules": "^0.0.2",
    "@google/genai": "^3.6.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "eslint": "^10.15.0",
    "express": "^4.21.2",
    "firebase": "^13.4.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/express": "^4.17.21"
  }
}

```

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}

```

## File: `vite.config.ts`

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: [
        'react',
        'react-dom',
        'motion',
        'firebase',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
        '@firebase/component',
        '@firebase/util',
      ],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'motion/react', 'lucide-react'],
      exclude: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

## File: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SLIIT Freelance Hub — Campus-Only Student Marketplace</title>
    <meta
      name="description"
      content="Exclusive freelance services marketplace for verified SLIIT students across Malabe, Metro, Kandy, Matara, Kurunegala, and Jaffna campuses."
    />
    <meta property="og:title" content="SLIIT Freelance Hub — Campus-Only Student Marketplace" />
    <meta
      property="og:description"
      content="Hire verified SLIIT student talent or sell your skills on campus with transparent 25% platform commission and escrowed orders."
    />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/png" href="/assets/aistudio/image_904ea47c.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="glass-canvas text-slate-900 antialiased selection:bg-amber-200 selection:text-slate-950">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

## File: `src/index.css`

```css
@import "tailwindcss";

@layer base {
  :root {
    --font-display: "Bricolage Grotesque", system-ui, -apple-system, sans-serif;
    --font-sans: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  }

  html {
    font-family: var(--font-sans);
    scroll-behavior: smooth;
  }

  h1, h2, h3, .font-display {
    font-family: var(--font-display);
  }

  .font-mono-num {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
}

/* Frosted Glass UI System */
.glass-canvas {
  background-color: #eef3f9;
  background-image:
    radial-gradient(at 8% 12%, rgba(14, 116, 144, 0.10) 0px, transparent 48%),
    radial-gradient(at 88% 8%, rgba(217, 119, 6, 0.11) 0px, transparent 42%),
    radial-gradient(at 78% 72%, rgba(11, 31, 58, 0.08) 0px, transparent 52%),
    radial-gradient(at 18% 84%, rgba(16, 185, 129, 0.08) 0px, transparent 45%);
  background-attachment: fixed;
}

.glass-nav {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(22px) saturate(165%);
  -webkit-backdrop-filter: blur(22px) saturate(165%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow:
    0 12px 32px -12px rgba(11, 31, 58, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.86);
  box-shadow:
    0 14px 36px -16px rgba(11, 31, 58, 0.12),
    0 1px 3px rgba(11, 31, 58, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.glass-card {
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(14px) saturate(145%);
  -webkit-backdrop-filter: blur(14px) saturate(145%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow:
    0 10px 28px -14px rgba(11, 31, 58, 0.11),
    0 1px 2px rgba(11, 31, 58, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.54);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.72);
}

.glass-input {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.42);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

```

## File: `src/main.tsx`

```tsx
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

```

## File: `src/types/marketplace.ts`

```ts
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


```

## File: `src/utils/campusRules.ts`

```ts
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


```

## File: `src/data/seedData.ts`

```ts
import type { Gig, KuppiSession, Order } from '../types/marketplace';
import { calculateCommissionSplit } from '../utils/campusRules';

export const HERO_BANNER_IMAGE = '/src/assets/images/sliit_malabe_hd.jpg';

const IMG_WEB = '/src/assets/images/gig_fullstack_web_1794999150964.jpg';
const IMG_FIGMA = '/src/assets/images/gig_uiux_figma_1794999150109.jpg';
const IMG_VIDEO = '/src/assets/images/gig_video_motion_1794999152117.jpg';
const IMG_DATA = '/src/assets/images/gig_data_ai_1794999150650.jpg';
const IMG_LATEX = '/src/assets/images/gig_academic_latex_1794999152926.jpg';

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Software & Web': IMG_WEB,
  'UI/UX & Figma': IMG_FIGMA,
  'Data & AI': IMG_DATA,
  'Academic & LaTeX': IMG_LATEX,
  'Video & Motion': IMG_VIDEO,
  'Business & Decks': IMG_LATEX,
  'Free Peer Help': IMG_WEB,
};

function makeGig(
  id: string,
  priceLkr: number,
  rest: Omit<Gig, 'id' | 'isFree' | 'priceLkr' | 'platformFeeLkr' | 'sellerPayoutLkr'>
): Gig {
  const split = calculateCommissionSplit(priceLkr);
  return {
    id,
    isFree: split.grossAmountLkr === 0,
    priceLkr: split.grossAmountLkr,
    platformFeeLkr: split.platformFeeLkr,
    sellerPayoutLkr: split.sellerPayoutLkr,
    ...rest,
  };
}

function makeOrder(
  id: string,
  grossAmountLkr: number,
  rest: Omit<Order, 'id' | 'grossAmountLkr' | 'platformFeeRate' | 'platformFeeLkr' | 'sellerPayoutLkr'>
): Order {
  const split = calculateCommissionSplit(grossAmountLkr);
  return {
    id,
    grossAmountLkr: split.grossAmountLkr,
    platformFeeRate: split.platformFeeRate,
    platformFeeLkr: split.platformFeeLkr,
    sellerPayoutLkr: split.sellerPayoutLkr,
    ...rest,
  };
}

export const SEED_GIGS: Gig[] = [
  makeGig('gig-sliit-01', 12000, {
    sellerId: 'seed-seller-kavindu',
    sellerName: 'Kavindu Senanayake',
    sellerSliitId: 'IT21849210',
    sellerCampus: 'Malabe',
    sellerFaculty: 'Computing',
    title: 'Full-Stack React, Node & MongoDB Web Application Build',
    description:
      'Production-ready web architecture with JWT auth, REST APIs, and responsive UI tailored for campus startups, club portals, and software engineering showcases.',
    category: 'Software & Web',
    deliveryDays: 4,
    revisions: 3,
    deliverables: ['Git repository & clean README', 'REST API integration', 'Responsive mobile layout', 'Deployment walkthrough'],
    imageUrl: IMG_WEB,
    rating: 4.9,
    reviewCount: 22,
    status: 'active',
    createdAtMs: 1731600000000,
  }),
  makeGig('gig-sliit-02', 7500, {
    sellerId: 'seed-seller-senuri',
    sellerName: 'Senuri Wickramasinghe',
    sellerSliitId: 'IT22104833',
    sellerCampus: 'Metro',
    sellerFaculty: 'Computing',
    title: 'Interactive Figma Design System & Mobile App Prototype',
    description:
      'Clean component-based Figma UI kits, user journey wireframes, and interactive click-through prototypes ready for engineering handoff.',
    category: 'UI/UX & Figma',
    deliveryDays: 3,
    revisions: 3,
    deliverables: ['Source Figma file', 'Reusable design tokens', 'Interactive prototype link', 'Asset export pack'],
    imageUrl: IMG_FIGMA,
    rating: 5.0,
    reviewCount: 18,
    status: 'active',
    createdAtMs: 1731550000000,
  }),
  makeGig('gig-sliit-free-01', 0, {
    sellerId: 'seed-seller-dilshan',
    sellerName: 'Dilshan Rodrigo',
    sellerSliitId: 'IT20784120',
    sellerCampus: 'Malabe',
    sellerFaculty: 'Computing',
    title: 'Free Git, GitHub & Branch Merge Conflict Peer Help',
    description:
      'Senior Y4 volunteer helping Y1/Y2 SLIIT project teams resolve Git merge conflicts, set up clean pull request workflows, and organize group repositories at zero cost.',
    category: 'Free Peer Help',
    deliveryDays: 1,
    revisions: 2,
    deliverables: ['30-min live troubleshooting call', 'Clean branch structure setup', '.gitignore & README check'],
    imageUrl: IMG_WEB,
    rating: 5.0,
    reviewCount: 34,
    status: 'active',
    createdAtMs: 1731620000000,
  }),
  makeGig('gig-sliit-03', 10000, {
    sellerId: 'seed-seller-tharindu',
    sellerName: 'Tharindu Jayasinghe',
    sellerSliitId: 'IT21330194',
    sellerCampus: 'Malabe',
    sellerFaculty: 'Computing',
    title: 'Python ML Pipeline, Model Evaluation & Visualization Report',
    description:
      'End-to-end scikit-learn or PyTorch training notebooks with cross-validation metrics, confusion matrices, and clean interactive Matplotlib/Plotly exports.',
    category: 'Data & AI',
    deliveryDays: 4,
    revisions: 2,
    deliverables: ['Clean Jupyter notebook', 'Evaluation metrics summary', 'High-DPI chart exports'],
    imageUrl: IMG_DATA,
    rating: 4.8,
    reviewCount: 15,
    status: 'active',
    createdAtMs: 1731500000000,
  }),
  makeGig('gig-sliit-free-02', 0, {
    sellerId: 'seed-seller-chamodi',
    sellerName: 'Chamodi Jayawardena',
    sellerSliitId: 'IT21662901',
    sellerCampus: 'Kandy',
    sellerFaculty: 'Computing',
    title: 'Free Internship CV & LinkedIn Review for SLIIT Students',
    description:
      'Completed my industrial training in software engineering. Happy to review Y2/Y3 resumes, GitHub pins, and LinkedIn headlines free for fellow SLIIT students.',
    category: 'Free Peer Help',
    deliveryDays: 2,
    revisions: 1,
    deliverables: ['Annotated CV feedback PDF', 'ATS formatting checklist', '3 LinkedIn headline suggestions'],
    imageUrl: IMG_LATEX,
    rating: 4.9,
    reviewCount: 27,
    status: 'active',
    createdAtMs: 1731590000000,
  }),
  makeGig('gig-sliit-04', 4500, {
    sellerId: 'seed-seller-amaya',
    sellerName: 'Amaya Dissanayake',
    sellerSliitId: 'EN21409281',
    sellerCampus: 'Kandy',
    sellerFaculty: 'Engineering',
    title: 'IEEE & Research Paper LaTeX Typesetting + Vector Diagrams',
    description:
      'Convert messy Word drafts into publication-grade Overleaf LaTeX documents with BibTeX citations, clean equations, and sharp vector architecture diagrams.',
    category: 'Academic & LaTeX',
    deliveryDays: 2,
    revisions: 3,
    deliverables: ['Overleaf ZIP source', 'Print-ready PDF', 'Vector SVG/PDF figures'],
    imageUrl: IMG_LATEX,
    rating: 4.9,
    reviewCount: 31,
    status: 'active',
    createdAtMs: 1731450000000,
  }),
  makeGig('gig-sliit-free-03', 0, {
    sellerId: 'seed-seller-yasiru',
    sellerName: 'Yasiru Wijesinghe',
    sellerSliitId: 'EN21902344',
    sellerCampus: 'Metro',
    sellerFaculty: 'Engineering',
    title: 'Free Year 1 Java OOP & C++ Lab Debugging Clinic',
    description:
      'Offering free 1-on-1 code walkthroughs for first-year Computing & Engineering students stuck on pointers, inheritance, or Eclipse/VS Code setup.',
    category: 'Free Peer Help',
    deliveryDays: 1,
    revisions: 1,
    deliverables: ['1-on-1 code explanation', 'IDE setup check', 'Practice exercise pointers'],
    imageUrl: IMG_DATA,
    rating: 4.9,
    reviewCount: 19,
    status: 'active',
    createdAtMs: 1731570000000,
  }),
  makeGig('gig-sliit-05', 8000, {
    sellerId: 'seed-seller-ravindu',
    sellerName: 'Ravindu Fernando',
    sellerSliitId: 'IT22559012',
    sellerCampus: 'Matara',
    sellerFaculty: 'Computing',
    title: 'Product Demo Reel, Club Event Promo & Color Grading',
    description:
      'Crisp 60fps product walkthrough videos, SLIIT society promo trailers, kinetic typography callouts, and audio mastering in DaVinci Resolve.',
    category: 'Video & Motion',
    deliveryDays: 3,
    revisions: 2,
    deliverables: ['1080p / 4K MP4 master', 'Social aspect ratio cut', 'Licensed background audio mix'],
    imageUrl: IMG_VIDEO,
    rating: 4.8,
    reviewCount: 11,
    status: 'active',
    createdAtMs: 1731400000000,
  }),
  makeGig('gig-sliit-06', 6000, {
    sellerId: 'seed-seller-nisansala',
    sellerName: 'Nisansala Perera',
    sellerSliitId: 'BM21992045',
    sellerCampus: 'Metro',
    sellerFaculty: 'Business',
    title: 'Startup Pitch Deck, Market Sizing & Financial Model Sheet',
    description:
      'Investor-grade 15-slide presentation deck paired with a structured 3-year unit economics spreadsheet for SLIIT Startup Battle and business modules.',
    category: 'Business & Decks',
    deliveryDays: 2,
    revisions: 3,
    deliverables: ['Editable PPTX & PDF deck', 'Linked Excel/Sheets model', 'Speaker notes outline'],
    imageUrl: IMG_LATEX,
    rating: 4.9,
    reviewCount: 14,
    status: 'active',
    createdAtMs: 1731350000000,
  }),
];

export const SEED_KUPPI_SESSIONS: KuppiSession[] = [
  {
    id: 'kuppi-it2070-01',
    hostId: 'seed-seller-dilshan',
    hostName: 'Dilshan Rodrigo',
    hostSliitId: 'IT20784120',
    hostCampus: 'Malabe',
    sessionType: 'kuppi',
    moduleCode: 'IT2070',
    title: 'Data Structures & Algorithms — Trees, AVL & Dijkstra Kuppi',
    topicSummary:
      'Live whiteboard + Java code walkthrough covering binary search tree rotations, heapify complexity, and 2024/2025 SLIIT past paper questions.',
    mode: 'On-Campus',
    locationOrLink: 'Malabe Main Building · Hall A502',
    scheduleLabel: 'Thu 5:30 PM – 7:30 PM',
    priceLkr: 0,
    platformFeeLkr: 0,
    sellerPayoutLkr: 0,
    maxSeats: 40,
    attendeeIds: ['seed-buyer-dineth', 'seed-buyer-pasindu', 'seed-seller-senuri'],
    status: 'open',
    createdAtMs: 1731690000000,
  },
  {
    id: 'study-dbms-02',
    hostId: 'seed-buyer-oshadi',
    hostName: 'Oshadi Silva',
    hostSliitId: 'IT22440119',
    hostCampus: 'Malabe',
    sessionType: 'study_group',
    moduleCode: 'IT2040',
    title: 'DBMS Normalization & SQL Joins Exam Study Together',
    topicSummary:
      'Quiet group revision at Malabe Library Floor 3! Bring your past papers and lecture slides — solving 3NF/BCNF normalization & complex SQL queries together.',
    mode: 'On-Campus',
    locationOrLink: 'Malabe Library · 3rd Floor Study Tables',
    scheduleLabel: 'Fri 2:00 PM – 5:00 PM',
    priceLkr: 0,
    platformFeeLkr: 0,
    sellerPayoutLkr: 0,
    maxSeats: 12,
    attendeeIds: ['seed-buyer-dineth', 'seed-buyer-sanduni'],
    status: 'open',
    createdAtMs: 1731680000000,
  },
  {
    id: 'kuppi-en1020-03',
    hostId: 'seed-seller-amaya',
    hostName: 'Amaya Dissanayake',
    hostSliitId: 'EN21409281',
    hostCampus: 'Kandy',
    sessionType: 'kuppi',
    moduleCode: 'EN1020',
    title: 'Engineering Maths II — Differential Equations & Laplace Kuppi',
    topicSummary:
      'Focused 2-hour intensive session with worked formula sheet PDF and step-by-step solutions to common SLIIT Engineering midterm problems.',
    mode: 'Online',
    locationOrLink: 'MS Teams (Link shared upon joining)',
    scheduleLabel: 'Sat 7:00 PM – 9:00 PM',
    priceLkr: 1000,
    platformFeeLkr: 250,
    sellerPayoutLkr: 750,
    maxSeats: 30,
    attendeeIds: ['seed-buyer-sanduni'],
    status: 'open',
    createdAtMs: 1731670000000,
  },
  {
    id: 'study-itp-04',
    hostId: 'seed-seller-ravindu',
    hostName: 'Ravindu Fernando',
    hostSliitId: 'IT22559012',
    hostCampus: 'Matara',
    sessionType: 'study_group',
    moduleCode: 'IT2080',
    title: 'ITP MERN Project Late-Night Coding & Bug-Bash Group',
    topicSummary:
      'Open study room for Y2S2 students building their ITP group projects. Come share your screen, test APIs, and keep each other accountable!',
    mode: 'Online',
    locationOrLink: 'Campus Discord · Study Room #2',
    scheduleLabel: 'Sun 9:00 PM – 11:30 PM',
    priceLkr: 0,
    platformFeeLkr: 0,
    sellerPayoutLkr: 0,
    maxSeats: 25,
    attendeeIds: ['seed-seller-kavindu', 'seed-seller-nisansala'],
    status: 'open',
    createdAtMs: 1731660000000,
  },
];

export const SEED_ORDERS: Order[] = [
  makeOrder('ORD-SLIIT-1041', 12000, {
    gigId: 'gig-sliit-01',
    gigTitle: 'Full-Stack React, Node & MongoDB Web Application Build',
    category: 'Software & Web',
    buyerId: 'seed-buyer-dineth',
    buyerName: 'Dineth Gunasekara',
    buyerCampus: 'Malabe',
    sellerId: 'seed-seller-kavindu',
    sellerName: 'Kavindu Senanayake',
    sellerCampus: 'Malabe',
    requirements: 'Need an event registration portal for our SLIIT Robotics Society workshop.',
    deliveryNote: 'Repository pushed and deployed to staging URL with admin CSV export.',
    status: 'completed',
    createdAtMs: 1731520000000,
    updatedAtMs: 1731610000000,
  }),
  makeOrder('ORD-SLIIT-1042', 7500, {
    gigId: 'gig-sliit-02',
    gigTitle: 'Interactive Figma Design System & Mobile App Prototype',
    category: 'UI/UX & Figma',
    buyerId: 'seed-buyer-oshadi',
    buyerName: 'Oshadi Silva',
    buyerCampus: 'Kandy',
    sellerId: 'seed-seller-senuri',
    sellerName: 'Senuri Wickramasinghe',
    sellerCampus: 'Metro',
    requirements: '12 mobile screens for campus shuttle tracker UI.',
    deliveryNote: 'Shared Figma workspace link with full auto-layout components.',
    status: 'completed',
    createdAtMs: 1731580000000,
    updatedAtMs: 1731650000000,
  }),
  makeOrder('ORD-SLIIT-1043', 10000, {
    gigId: 'gig-sliit-03',
    gigTitle: 'Python ML Pipeline, Model Evaluation & Visualization Report',
    category: 'Data & AI',
    buyerId: 'seed-buyer-pasindu',
    buyerName: 'Pasindu Bandara',
    buyerCampus: 'Malabe',
    sellerId: 'seed-seller-tharindu',
    sellerName: 'Tharindu Jayasinghe',
    sellerCampus: 'Malabe',
    requirements: 'Compare Random Forest and XGBoost on Sri Lankan energy consumption dataset.',
    deliveryNote: 'Jupyter notebook and ROC curve figures uploaded for review.',
    status: 'delivered',
    createdAtMs: 1731660000000,
    updatedAtMs: 1731690000000,
  }),
  makeOrder('ORD-SLIIT-1044', 4500, {
    gigId: 'gig-sliit-04',
    gigTitle: 'IEEE & Research Paper LaTeX Typesetting + Vector Diagrams',
    category: 'Academic & LaTeX',
    buyerId: 'seed-buyer-sanduni',
    buyerName: 'Sanduni Herath',
    buyerCampus: 'Kurunegala',
    sellerId: 'seed-seller-amaya',
    sellerName: 'Amaya Dissanayake',
    sellerCampus: 'Kandy',
    requirements: 'Format 8-page IEEE double-column conference draft with 4 architecture diagrams.',
    deliveryNote: '',
    status: 'in_progress',
    createdAtMs: 1731700000000,
    updatedAtMs: 1731700000000,
  }),
];

```

## File: `src/services/firebaseClient.ts`

```ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Gig, KuppiSession, Order, OrderStatus, UserProfile } from '../types/marketplace';
import { FOUNDER_ADMIN_EMAIL } from '../utils/campusRules';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

void testConnection();

export async function signInWithGoogleAccount() {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signOutFirebase() {
  await signOut(auth);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      sliitEmail: data.sliitEmail,
      sliitStudentId: data.sliitStudentId,
      campus: data.campus,
      faculty: data.faculty,
      batch: data.batch,
      role: 'student',
      verifiedCampus: Boolean(data.verifiedCampus),
      isFounderAdmin: auth.currentUser?.email === FOUNDER_ADMIN_EMAIL,
      createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: Omit<UserProfile, 'createdAtMs' | 'isFounderAdmin'>): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const ref = doc(db, 'users', profile.uid);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        displayName: profile.displayName,
        sliitEmail: profile.sliitEmail,
        sliitStudentId: profile.sliitStudentId,
        campus: profile.campus,
        faculty: profile.faculty,
        batch: profile.batch,
        verifiedCampus: profile.verifiedCampus,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        uid: profile.uid,
        displayName: profile.displayName,
        sliitEmail: profile.sliitEmail,
        sliitStudentId: profile.sliitStudentId,
        campus: profile.campus,
        faculty: profile.faculty,
        batch: profile.batch,
        role: 'student',
        verifiedCampus: profile.verifiedCampus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeActiveGigs(
  onData: (gigs: Gig[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'gigs';
  const q = query(collection(db, path), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Gig[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sellerId: data.sellerId,
          sellerName: data.sellerName,
          sellerSliitId: data.sellerSliitId,
          sellerCampus: data.sellerCampus,
          sellerFaculty: data.sellerFaculty,
          title: data.title,
          description: data.description,
          category: data.category,
          isFree: Boolean(data.isFree) || data.priceLkr === 0,
          priceLkr: data.priceLkr,
          platformFeeLkr: data.platformFeeLkr,
          sellerPayoutLkr: data.sellerPayoutLkr,
          deliveryDays: data.deliveryDays,
          revisions: data.revisions,
          deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
          imageUrl: data.imageUrl,
          rating: data.rating ?? 5.0,
          reviewCount: data.reviewCount ?? 0,
          status: data.status,
          createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createGigDoc(gig: Omit<Gig, 'id' | 'createdAtMs'>): Promise<string> {
  const safeId = `gig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `gigs/${safeId}`;
  try {
    await setDoc(doc(db, 'gigs', safeId), {
      ...gig,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeKuppiSessions(
  onData: (sessions: KuppiSession[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'kuppiSessions';
  const q = query(collection(db, path), where('status', 'in', ['open', 'full']), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: KuppiSession[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          hostId: data.hostId,
          hostName: data.hostName,
          hostSliitId: data.hostSliitId,
          hostCampus: data.hostCampus,
          sessionType: data.sessionType,
          moduleCode: data.moduleCode,
          title: data.title,
          topicSummary: data.topicSummary,
          mode: data.mode,
          locationOrLink: data.locationOrLink,
          scheduleLabel: data.scheduleLabel,
          priceLkr: data.priceLkr ?? 0,
          platformFeeLkr: data.platformFeeLkr ?? 0,
          sellerPayoutLkr: data.sellerPayoutLkr ?? 0,
          maxSeats: data.maxSeats ?? 20,
          attendeeIds: Array.isArray(data.attendeeIds) ? data.attendeeIds : [],
          status: data.status,
          createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createKuppiSessionDoc(session: Omit<KuppiSession, 'id' | 'createdAtMs'>): Promise<string> {
  const safeId = `kuppi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `kuppiSessions/${safeId}`;
  try {
    await setDoc(doc(db, 'kuppiSessions', safeId), {
      ...session,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleJoinKuppiSessionDoc(
  sessionId: string,
  uid: string,
  currentlyJoined: boolean,
  nextStatus: 'open' | 'full'
): Promise<void> {
  const path = `kuppiSessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'kuppiSessions', sessionId), {
      attendeeIds: currentlyJoined ? arrayRemove(uid) : arrayUnion(uid),
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeUserOrders(
  uid: string,
  isAdmin: boolean,
  onData: (orders: Order[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'orders';
  if (isAdmin) {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onData(snap.docs.map(mapOrderDoc));
      },
      (err) => {
        if (onError) onError(err);
        else handleFirestoreError(err, OperationType.LIST, path);
      }
    );
  }

  let buyerList: Order[] = [];
  let sellerList: Order[] = [];
  const mergeAndEmit = () => {
    const map = new Map<string, Order>();
    for (const o of [...buyerList, ...sellerList]) {
      map.set(o.id, o);
    }
    onData(Array.from(map.values()).sort((a, b) => b.createdAtMs - a.createdAtMs));
  };

  const unsubBuyer = onSnapshot(
    query(collection(db, path), where('buyerId', '==', uid)),
    (snap) => {
      buyerList = snap.docs.map(mapOrderDoc);
      mergeAndEmit();
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );

  const unsubSeller = onSnapshot(
    query(collection(db, path), where('sellerId', '==', uid)),
    (snap) => {
      sellerList = snap.docs.map(mapOrderDoc);
      mergeAndEmit();
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}

function mapOrderDoc(d: { id: string; data: () => Record<string, any> }): Order {
  const data = d.data();
  return {
    id: d.id,
    gigId: data.gigId,
    gigTitle: data.gigTitle,
    category: data.category,
    buyerId: data.buyerId,
    buyerName: data.buyerName,
    buyerCampus: data.buyerCampus,
    sellerId: data.sellerId,
    sellerName: data.sellerName,
    sellerCampus: data.sellerCampus,
    grossAmountLkr: data.grossAmountLkr,
    platformFeeRate: data.platformFeeRate === 0 ? 0 : 0.25,
    platformFeeLkr: data.platformFeeLkr,
    sellerPayoutLkr: data.sellerPayoutLkr,
    requirements: data.requirements ?? '',
    deliveryNote: data.deliveryNote ?? '',
    status: data.status as OrderStatus,
    createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAtMs: data.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

export async function createOrderDoc(order: Omit<Order, 'id' | 'createdAtMs' | 'updatedAtMs'>): Promise<string> {
  const safeId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const path = `orders/${safeId}`;
  try {
    await setDoc(doc(db, 'orders', safeId), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusDoc(
  orderId: string,
  nextStatus: OrderStatus,
  deliveryNote?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const payload: Record<string, any> = {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    };
    if (deliveryNote !== undefined) {
      payload.deliveryNote = deliveryNote;
    }
    await updateDoc(doc(db, 'orders', orderId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

```

## File: `src/App.tsx`

```tsx
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { CampusAiView } from './components/CampusAiView';
import { CampusGateModal } from './components/CampusGateModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FounderLedgerView } from './components/FounderLedgerView';
import { GigDetailModal } from './components/GigDetailModal';
import { KuppiStudyView } from './components/KuppiStudyView';
import { MarketplaceView } from './components/MarketplaceView';
import { MyProfileView } from './components/MyProfileView';
import { OrdersView } from './components/OrdersView';
import { SellServiceView } from './components/SellServiceView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TopNav, type ActiveTab } from './components/TopNav';
import { SEED_GIGS, SEED_KUPPI_SESSIONS, SEED_ORDERS } from './data/seedData';
import {
  auth,
  createGigDoc,
  createKuppiSessionDoc,
  createOrderDoc,
  fetchUserProfile,
  saveUserProfile,
  signInWithGoogleAccount,
  signOutFirebase,
  subscribeActiveGigs,
  subscribeKuppiSessions,
  subscribeUserOrders,
  toggleJoinKuppiSessionDoc,
  updateOrderStatusDoc,
} from './services/firebaseClient';
import type { CampusBranch, Gig, KuppiSession, Order, OrderStatus, UserProfile } from './types/marketplace';
import {
  calculateCommissionSplit,
  computeStudentProfileStats,
  FOUNDER_ADMIN_EMAIL,
  type StudentIdentitySeed,
} from './utils/campusRules';

const STORAGE_SANDBOX_USER = 'sliit_hub_sandbox_user_v1';
const STORAGE_SANDBOX_GIGS = 'sliit_hub_sandbox_gigs_v1';
const STORAGE_SANDBOX_ORDERS = 'sliit_hub_sandbox_orders_v1';
const STORAGE_SANDBOX_KUPPI = 'sliit_hub_sandbox_kuppi_v1';

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('marketplace');
  const [selectedCampus, setSelectedCampus] = useState<CampusBranch | 'All'>('All');
  const [ordersSubTab, setOrdersSubTab] = useState<'orders' | 'ledger'>('orders');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseProfile, setFirebaseProfile] = useState<UserProfile | null>(null);
  const [sandboxUser, setSandboxUser] = useState<UserProfile | null>(() =>
    loadLocal<UserProfile | null>(STORAGE_SANDBOX_USER, null)
  );
  const [cloudGigs, setCloudGigs] = useState<Gig[]>([]);
  const [cloudOrders, setCloudOrders] = useState<Order[]>([]);
  const [cloudKuppi, setCloudKuppi] = useState<KuppiSession[]>([]);
  const [sandboxGigs, setSandboxGigs] = useState<Gig[]>(() => loadLocal<Gig[]>(STORAGE_SANDBOX_GIGS, []));
  const [sandboxOrders, setSandboxOrders] = useState<Order[]>(() =>
    loadLocal<Order[]>(STORAGE_SANDBOX_ORDERS, SEED_ORDERS)
  );
  const [sandboxKuppi, setSandboxKuppi] = useState<KuppiSession[]>(() =>
    loadLocal<KuppiSession[]>(STORAGE_SANDBOX_KUPPI, SEED_KUPPI_SESSIONS)
  );
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentIdentitySeed | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SANDBOX_USER, JSON.stringify(sandboxUser));
    } catch {
      // Ignore storage quota errors
    }
  }, [sandboxUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SANDBOX_GIGS, JSON.stringify(sandboxGigs));
    } catch {
      // Ignore storage quota errors
    }
  }, [sandboxGigs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SANDBOX_ORDERS, JSON.stringify(sandboxOrders));
    } catch {
      // Ignore storage quota errors
    }
  }, [sandboxOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SANDBOX_KUPPI, JSON.stringify(sandboxKuppi));
    } catch {
      // Ignore storage quota errors
    }
  }, [sandboxKuppi]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          setFirebaseProfile(profile);
        } catch {
          setFirebaseProfile(null);
        }
      } else {
        setFirebaseProfile(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeActiveGigs(
      (items) => setCloudGigs(items),
      () => {
        setCloudGigs([]);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeKuppiSessions(
      (items) => setCloudKuppi(items),
      () => {
        setCloudKuppi([]);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setCloudOrders([]);
      return;
    }
    const isAdmin = firebaseUser.email === FOUNDER_ADMIN_EMAIL && firebaseUser.emailVerified;
    const unsub = subscribeUserOrders(
      firebaseUser.uid,
      isAdmin,
      (items) => setCloudOrders(items),
      () => setCloudOrders([])
    );
    return () => unsub();
  }, [firebaseUser]);

  const currentUser = firebaseProfile ?? sandboxUser;

  const allGigs = useMemo(() => {
    const byId = new Map<string, Gig>();
    for (const g of SEED_GIGS) byId.set(g.id, g);
    for (const g of sandboxGigs) byId.set(g.id, g);
    for (const g of cloudGigs) byId.set(g.id, g);
    return Array.from(byId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [cloudGigs, sandboxGigs]);

  const allOrders = useMemo(() => {
    const byId = new Map<string, Order>();
    for (const o of sandboxOrders) byId.set(o.id, o);
    for (const o of cloudOrders) byId.set(o.id, o);
    return Array.from(byId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [cloudOrders, sandboxOrders]);

  const allKuppiSessions = useMemo(() => {
    const byId = new Map<string, KuppiSession>();
    for (const s of sandboxKuppi) byId.set(s.id, s);
    for (const s of cloudKuppi) byId.set(s.id, s);
    return Array.from(byId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [cloudKuppi, sandboxKuppi]);

  const freeGigsCount = useMemo(
    () => allGigs.filter((g) => g.status === 'active' && (g.isFree || g.priceLkr === 0)).length,
    [allGigs]
  );

  const currentUserStats = useMemo(() => {
    if (!currentUser) return null;
    return computeStudentProfileStats(
      {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        sliitStudentId: currentUser.sliitStudentId,
        campus: currentUser.campus,
        faculty: currentUser.faculty,
        verifiedCampus: currentUser.verifiedCampus,
      },
      allGigs,
      allOrders,
      allKuppiSessions
    );
  }, [currentUser, allGigs, allOrders, allKuppiSessions]);

  const selectedGigSellerStats = useMemo(() => {
    if (!selectedGig) return null;
    return computeStudentProfileStats(
      {
        uid: selectedGig.sellerId,
        displayName: selectedGig.sellerName,
        sliitStudentId: selectedGig.sellerSliitId,
        campus: selectedGig.sellerCampus,
        faculty: selectedGig.sellerFaculty,
        verifiedCampus: true,
      },
      allGigs,
      allOrders,
      allKuppiSessions
    );
  }, [selectedGig, allGigs, allOrders, allKuppiSessions]);

  const showToast = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => {
      setNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogleAccount();
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    setFirebaseProfile(null);
    setSandboxUser(null);
    showToast('Signed out of SLIIT Freelance Hub.');
  };

  const handleVerifyCampusProfile = async (profileInput: Omit<UserProfile, 'uid' | 'createdAtMs'>) => {
    if (firebaseUser) {
      await saveUserProfile({
        uid: firebaseUser.uid,
        displayName: profileInput.displayName,
        sliitEmail: profileInput.sliitEmail,
        sliitStudentId: profileInput.sliitStudentId,
        campus: profileInput.campus,
        faculty: profileInput.faculty,
        batch: profileInput.batch,
        role: 'student',
        verifiedCampus: true,
      });
      const saved = await fetchUserProfile(firebaseUser.uid);
      setFirebaseProfile(saved);
      showToast(`Verified SLIIT access for ${profileInput.sliitStudentId}.`);
    } else {
      const localProfile: UserProfile = {
        uid: `sliit_${profileInput.sliitStudentId.toLowerCase()}`,
        ...profileInput,
        createdAtMs: Date.now(),
      };
      setSandboxUser(localProfile);
      showToast(`Campus access verified for ${localProfile.sliitStudentId} (${localProfile.campus}).`);
    }
  };

  const handleEnterDemoStudent = (asFounder = false) => {
    const demoProfile: UserProfile = asFounder
      ? {
          uid: 'founder-admin-kalana',
          displayName: 'Kalana Mahisuru (Founder)',
          sliitEmail: 'it21000001@my.sliit.lk',
          sliitStudentId: 'IT21000001',
          campus: 'Malabe',
          faculty: 'Computing',
          batch: 'Alumni / Founder',
          role: 'student',
          verifiedCampus: true,
          isFounderAdmin: true,
          createdAtMs: Date.now(),
        }
      : {
          uid: 'demo-student-it21849210',
          displayName: 'Kasun Perera',
          sliitEmail: 'it21849210@my.sliit.lk',
          sliitStudentId: 'IT21849210',
          campus: 'Malabe',
          faculty: 'Computing',
          batch: 'Y3S2',
          role: 'student',
          verifiedCampus: true,
          isFounderAdmin: false,
          createdAtMs: Date.now(),
        };
    setSandboxUser(demoProfile);
    if (asFounder) {
      setOrdersSubTab('ledger');
      selectTab('orders');
    }
    showToast(
      asFounder
        ? 'Founder Admin mode active — viewing 25% commission ledger.'
        : 'Campus sandbox active as Kasun Perera (IT21849210).'
    );
  };

  const handleCreateGig = async (gigInput: Omit<Gig, 'id' | 'createdAtMs'>) => {
    if (firebaseUser && firebaseProfile) {
      await createGigDoc(gigInput);
    } else {
      const newGig: Gig = {
        id: `gig-local-${Date.now()}`,
        createdAtMs: Date.now(),
        ...gigInput,
      };
      setSandboxGigs((prev) => [newGig, ...prev]);
    }
    selectTab('marketplace');
    showToast(
      gigInput.isFree
        ? `Published free community help "${gigInput.title}" to SLIIT Freelance Hub.`
        : `Published "${gigInput.title}" to SLIIT Freelance Hub.`
    );
  };

  const handlePlaceOrder = async (gig: Gig, requirements: string) => {
    if (!currentUser) {
      setGateOpen(true);
      return;
    }
    const isFree = gig.isFree || gig.priceLkr === 0;
    const split = calculateCommissionSplit(isFree ? 0 : gig.priceLkr);
    const baseOrder: Omit<Order, 'id' | 'createdAtMs' | 'updatedAtMs'> = {
      gigId: gig.id,
      gigTitle: gig.title,
      category: gig.category,
      buyerId: currentUser.uid,
      buyerName: currentUser.displayName,
      buyerCampus: currentUser.campus,
      sellerId: gig.sellerId,
      sellerName: gig.sellerName,
      sellerCampus: gig.sellerCampus,
      grossAmountLkr: split.grossAmountLkr,
      platformFeeRate: split.platformFeeRate,
      platformFeeLkr: split.platformFeeLkr,
      sellerPayoutLkr: split.sellerPayoutLkr,
      requirements,
      deliveryNote: '',
      status: 'in_progress',
    };

    if (firebaseUser && firebaseProfile && !gig.id.startsWith('gig-sliit-')) {
      await createOrderDoc(baseOrder);
    } else {
      const newOrder: Order = {
        id: `ORD-SLIIT-${Math.floor(1050 + Math.random() * 8900)}`,
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
        ...baseOrder,
      };
      setSandboxOrders((prev) => [newOrder, ...prev]);
    }
    setOrdersSubTab('orders');
    selectTab('orders');
    showToast(
      isFree
        ? 'Free peer help request sent! LKR 0 fee logged.'
        : `Order placed! LKR ${split.platformFeeLkr.toLocaleString()} (25%) logged to platform escrow.`
    );
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus, deliveryNote?: string) => {
    const isCloud = cloudOrders.some((o) => o.id === orderId);
    if (firebaseUser && isCloud) {
      await updateOrderStatusDoc(orderId, nextStatus, deliveryNote);
    } else {
      setSandboxOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                deliveryNote: deliveryNote !== undefined ? deliveryNote : o.deliveryNote,
                updatedAtMs: Date.now(),
              }
            : o
        )
      );
    }
    showToast(`Order ${orderId} updated to ${nextStatus.replace('_', ' ')}.`);
  };

  const handleCreateKuppi = async (sessionInput: Omit<KuppiSession, 'id' | 'createdAtMs'>) => {
    if (firebaseUser && firebaseProfile) {
      await createKuppiSessionDoc(sessionInput);
    } else {
      const newSession: KuppiSession = {
        id: `kuppi-local-${Date.now()}`,
        createdAtMs: Date.now(),
        ...sessionInput,
      };
      setSandboxKuppi((prev) => [newSession, ...prev]);
    }
    showToast(`Published ${sessionInput.moduleCode} session "${sessionInput.title}".`);
  };

  const handleToggleJoinKuppi = async (sessionId: string) => {
    if (!currentUser) {
      setGateOpen(true);
      return;
    }

    const isCloud = cloudKuppi.some((s) => s.id === sessionId);
    const target = allKuppiSessions.find((s) => s.id === sessionId);
    if (!target) return;

    const currentlyJoined = target.attendeeIds.includes(currentUser.uid);
    const nextCount = currentlyJoined ? target.attendeeIds.length - 1 : target.attendeeIds.length + 1;
    const nextStatus = nextCount >= target.maxSeats ? 'full' : 'open';

    if (firebaseUser && firebaseProfile && isCloud) {
      await toggleJoinKuppiSessionDoc(sessionId, currentUser.uid, currentlyJoined, nextStatus);
    } else {
      setSandboxKuppi((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const nextAttendees = currentlyJoined
            ? s.attendeeIds.filter((id) => id !== currentUser.uid)
            : [...s.attendeeIds, currentUser.uid];
          return {
            ...s,
            attendeeIds: nextAttendees,
            status: nextAttendees.length >= s.maxSeats ? 'full' : 'open',
          };
        })
      );
    }

    showToast(
      currentlyJoined
        ? `Left seat in ${target.moduleCode} session.`
        : `Seat reserved in ${target.moduleCode}! Share the invite with your SLIIT friends.`
    );
  };

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen flex flex-col text-slate-900">
          <TopNav
            activeTab={activeTab}
            onSelectTab={selectTab}
            currentUser={currentUser}
            onOpenGate={() => setGateOpen(true)}
          />

          <AnimatePresence>
            {notice && (
              <motion.div
                key={notice}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none"
              >
                <div
                  role="status"
                  aria-live="polite"
                  className="bg-[#0B1F3A]/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-xl text-center shadow-lg border border-white/15"
                >
                  {notice}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'marketplace' && (
                  <MarketplaceView
                    gigs={allGigs}
                    orders={allOrders}
                    kuppiSessions={allKuppiSessions}
                    currentUser={currentUser}
                    campus={selectedCampus}
                    onCampusChange={setSelectedCampus}
                    onSelectGig={(gig) => setSelectedGig(gig)}
                    onOpenProfile={(identity) => setSelectedStudentProfile(identity)}
                    onToggleJoinKuppi={handleToggleJoinKuppi}
                    onOpenGate={() => setGateOpen(true)}
                    onNavigateSell={() => selectTab('sell')}
                    onNavigateKuppi={() => selectTab('kuppi')}
                    onNavigateAi={() => selectTab('ai')}
                  />
                )}

                {activeTab === 'kuppi' && (
                  <KuppiStudyView
                    sessions={allKuppiSessions}
                    gigs={allGigs}
                    orders={allOrders}
                    currentUser={currentUser}
                    campusFilter={selectedCampus}
                    onCampusChange={setSelectedCampus}
                    onOpenGate={() => setGateOpen(true)}
                    onOpenProfile={(identity) => setSelectedStudentProfile(identity)}
                    onCreateSession={handleCreateKuppi}
                    onToggleJoin={handleToggleJoinKuppi}
                  />
                )}

                {activeTab === 'sell' && (
                  <SellServiceView
                    currentUser={currentUser}
                    onOpenGate={() => setGateOpen(true)}
                    onCreateGig={handleCreateGig}
                  />
                )}

                {activeTab === 'orders' && (
                  <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-6">
                    <div className="inline-flex items-center gap-1.5 p-1.5 glass-panel rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setOrdersSubTab('orders')}
                        className={`relative px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                          ordersSubTab === 'orders' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {ordersSubTab === 'orders' && (
                          <motion.span
                            layoutId="orders-subtab-pill"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="absolute inset-0 bg-[#0B1F3A] rounded-xl shadow-xs"
                          />
                        )}
                        <span className="relative z-10">My Campus Orders</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrdersSubTab('ledger')}
                        className={`relative px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                          ordersSubTab === 'ledger' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {ordersSubTab === 'ledger' && (
                          <motion.span
                            layoutId="orders-subtab-pill"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="absolute inset-0 bg-[#0B1F3A] rounded-xl shadow-xs"
                          />
                        )}
                        <span className="relative z-10">Founder 25% Commission Ledger</span>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={ordersSubTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                      >
                        {ordersSubTab === 'orders' ? (
                          <OrdersView
                            orders={allOrders}
                            currentUser={currentUser}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onOpenMarketplace={() => selectTab('marketplace')}
                            onOpenProfile={(identity) => setSelectedStudentProfile(identity)}
                          />
                        ) : (
                          <FounderLedgerView orders={allOrders} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <CampusAiView
                    currentUser={currentUser}
                    gigsCount={allGigs.length}
                    freeGigsCount={freeGigsCount}
                    kuppiCount={allKuppiSessions.length}
                  />
                )}

                {activeTab === 'profile' && (
                  <MyProfileView
                    currentUser={currentUser}
                    gigs={allGigs}
                    orders={allOrders}
                    kuppiSessions={allKuppiSessions}
                    onOpenGate={() => setGateOpen(true)}
                    onEnterDemoStudent={handleEnterDemoStudent}
                    onSelectGig={(gig) => setSelectedGig(gig)}
                    onNavigateSell={() => selectTab('sell')}
                    onNavigateKuppi={() => selectTab('kuppi')}
                    onNavigateOrders={() => {
                      setOrdersSubTab('orders');
                      selectTab('orders');
                    }}
                    onExploreMyCampus={() => {
                      if (currentUser) {
                        setSelectedCampus(currentUser.campus);
                      }
                      selectTab('marketplace');
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 pb-6 pt-4">
            <div className="glass-panel rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_904ea47c.png"
                  alt="SLIIT Freelance Hub shield logo"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-900/10 shrink-0"
                />
                <div>
                  <span className="font-display font-semibold text-[#0B1F3A]">SLIIT Freelance Hub</span>
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    Campus-exclusive student marketplace &amp; Kuppi hub (Malabe, Metro, Kandy, Matara, Kurunegala, Jaffna)
                  </span>
                </div>
              </div>
              <div className="font-mono-num font-medium text-slate-700">
                25% Paid Commission · 0% Free Peer Help · Hardened Security
              </div>
            </div>
          </footer>

          <CampusGateModal
            isOpen={gateOpen}
            onClose={() => setGateOpen(false)}
            currentUser={currentUser}
            profileStats={currentUserStats}
            authEmail={firebaseUser?.email ?? null}
            isFirebaseAuthenticated={Boolean(firebaseUser)}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            onVerifyCampusProfile={handleVerifyCampusProfile}
            onEnterDemoStudent={handleEnterDemoStudent}
            onOpenFullProfile={() => {
              if (!currentUser) return;
              selectTab('profile');
            }}
          />

        <GigDetailModal
          gig={selectedGig}
          sellerStats={selectedGigSellerStats}
          currentUser={currentUser}
          onClose={() => setSelectedGig(null)}
          onOpenProfile={(identity) => setSelectedStudentProfile(identity)}
          onOpenGate={() => {
            setSelectedGig(null);
            setGateOpen(true);
          }}
          onPlaceOrder={handlePlaceOrder}
        />

          <StudentProfileModal
            identity={selectedStudentProfile}
            gigs={allGigs}
            orders={allOrders}
            kuppiSessions={allKuppiSessions}
            onClose={() => setSelectedStudentProfile(null)}
            onSelectGig={(gig) => setSelectedGig(gig)}
          />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  );
}

```

## File: `src/components/TopNav.tsx`

```tsx
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { UserProfile } from '../types/marketplace';

export type ActiveTab = 'marketplace' | 'kuppi' | 'sell' | 'orders' | 'ai' | 'profile';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: UserProfile | null;
  onOpenGate: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'kuppi', label: 'Kuppi & Study' },
  { id: 'sell', label: 'Sell & Free' },
  { id: 'orders', label: 'Orders & 25%' },
  { id: 'ai', label: 'Campus AI' },
  { id: 'profile', label: 'My Profile' },
];

export function TopNav({ activeTab, onSelectTab, currentUser, onOpenGate }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 pt-3 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-[1240px] mx-auto pointer-events-auto">
        <div className="glass-nav rounded-2xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3 lg:gap-6">
          {/* Zone 1: Brand Emblem + Single-line Wordmark */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => handleNavClick('marketplace')}
            className="inline-flex items-center gap-2.5 font-display text-base sm:text-lg font-bold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0 cursor-pointer pr-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B1F3A]"
          >
            <img
              src="/src/assets/images/sliit_hub_emblem.png"
              alt="SLIIT Freelance Hub logo"
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-white/80 shrink-0"
            />
            <span>SLIIT Freelance Hub</span>
          </motion.button>

          {/* Zone 2: Animated Frosted Navigation Rail */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-1 bg-slate-900/[0.045] p-1 rounded-xl border border-white/70"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A] ${
                    isActive ? 'text-[#0B1F3A]' : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="topnav-active-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      className="absolute inset-0 bg-white/95 rounded-lg shadow-sm ring-1 ring-slate-900/5"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenGate}
              className="hidden sm:inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer bg-[#0B1F3A] text-white hover:bg-slate-800 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A]"
            >
              {currentUser ? `${currentUser.displayName.split(' ')[0]} · ${currentUser.sliitStudentId}` : 'Verify SLIIT Access'}
            </motion.button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-white/70 border border-white/60 focus-visible:outline-2 focus-visible:outline-[#0B1F3A]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Animated Tablet/Mobile Frosted Glass Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden mt-2 glass-panel rounded-2xl p-3 space-y-1.5"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-white text-[#0B1F3A] shadow-xs ring-1 ring-slate-900/5'
                        : 'text-slate-700 hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenGate();
                }}
                className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#0B1F3A] text-white text-center shadow-xs"
              >
                {currentUser ? `${currentUser.displayName} (${currentUser.sliitStudentId})` : 'Verify SLIIT Access'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

```

## File: `src/components/MarketplaceView.tsx`

```tsx
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

```

## File: `src/components/GigCard.tsx`

```tsx
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



```

## File: `src/components/GigDetailModal.tsx`

```tsx
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

```

## File: `src/components/KuppiStudyView.tsx`

```tsx
import { Award, BookOpen, Calendar, Check, Copy, MapPin, Plus, Search, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import {
  CAMPUS_BRANCHES,
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
                      <span className="truncate">{session.locationOrLink}</span>
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
                      disabled={isFull}
                      onClick={() => {
                        if (!currentUser) {
                          onOpenGate();
                          return;
                        }
                        void onToggleJoin(session.id);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                        isJoined
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-[#0B1F3A] text-white hover:bg-slate-800'
                      }`}
                    >
                      {isJoined ? 'Joined · Leave Seat' : isFull ? 'Session Full' : 'Join Session'}
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
    </div>
  );
}

```

## File: `src/components/SellServiceView.tsx`

```tsx
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

```

## File: `src/components/OrdersView.tsx`

```tsx
import { CheckCircle2, Clock, PackageCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Order, OrderStatus, UserProfile } from '../types/marketplace';
import { formatLkr, sanitizeTextInput, type StudentIdentitySeed } from '../utils/campusRules';

interface OrdersViewProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus, deliveryNote?: string) => Promise<void>;
  onOpenMarketplace: () => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800">
          <Clock className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
          <PackageCheck className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
  }
}

export function OrdersView({
  orders,
  currentUser,
  onUpdateStatus,
  onOpenMarketplace,
  onOpenProfile,
}: OrdersViewProps) {
  const [scope, setScope] = useState<'all' | 'buying' | 'selling'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});

  const visibleOrders = orders.filter((o) => {
    if (!currentUser || scope === 'all') return true;
    if (scope === 'buying') return o.buyerId === currentUser.uid;
    return o.sellerId === currentUser.uid;
  });

  const handleAction = async (orderId: string, nextStatus: OrderStatus) => {
    setBusyId(orderId);
    try {
      const note =
        nextStatus === 'delivered'
          ? sanitizeTextInput(deliveryNotes[orderId] ?? '', 600) ||
            'Delivered files and documentation to SLIIT buyer.'
          : undefined;
      await onUpdateStatus(orderId, nextStatus, note);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide">Escrowed Campus Orders</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
            Order Lifecycle &amp; Payouts
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Track deliverables, confirm handoff, and release the 75% seller payout / 25% platform commission split (or
            LKR 0 free peer help).
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-900/[0.05] rounded-xl border border-white/70 self-start">
          {(['all', 'buying', 'selling'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setScope(tab)}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                scope === tab ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scope === tab && (
                <motion.span
                  layoutId="orders-scope-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">{tab === 'all' ? 'All Orders' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <h3 className="font-display text-lg font-semibold text-slate-900">No campus orders in this view</h3>
          <p className="mt-2 text-sm text-slate-600">
            Browse active student services on the marketplace to place your first campus order.
          </p>
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="mt-5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order, idx) => {
            const isFree = order.grossAmountLkr === 0;
            const isBuyer = currentUser?.uid === order.buyerId;
            const isSeller = currentUser?.uid === order.sellerId;
            const canDeliver = order.status === 'in_progress' && (isSeller || currentUser?.isFounderAdmin);
            const canComplete = order.status === 'delivered' && (isBuyer || currentUser?.isFounderAdmin);
            const canCancel = order.status === 'in_progress' && (isBuyer || currentUser?.isFounderAdmin);

            return (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.2) }}
                whileHover={{ y: -2 }}
                className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-shadow hover:shadow-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono-num text-xs font-semibold text-slate-500">{order.id}</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <StatusBadge status={order.status} />
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-xs text-slate-600">{order.category}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900">{order.gigTitle}</h3>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      Buyer:
                      <button
                        type="button"
                        onClick={() =>
                          onOpenProfile({
                            uid: order.buyerId,
                            displayName: order.buyerName,
                            campus: order.buyerCampus,
                            verifiedCampus: true,
                          })
                        }
                        aria-label={`View achievement profile for buyer ${order.buyerName}`}
                        className="font-semibold text-[#0B1F3A] hover:underline cursor-pointer"
                      >
                        {order.buyerName}
                      </button>
                      <span>({order.buyerCampus})</span>
                    </span>
                    <span aria-hidden="true">→</span>
                    <span className="inline-flex items-center gap-1">
                      Seller:
                      <button
                        type="button"
                        onClick={() =>
                          onOpenProfile({
                            uid: order.sellerId,
                            displayName: order.sellerName,
                            campus: order.sellerCampus,
                            verifiedCampus: true,
                          })
                        }
                        aria-label={`View achievement profile for seller ${order.sellerName}`}
                        className="font-semibold text-[#0B1F3A] hover:underline cursor-pointer"
                      >
                        {order.sellerName}
                      </button>
                      <span>({order.sellerCampus})</span>
                    </span>
                  </div>

                  {order.requirements && (
                    <p className="text-xs text-slate-700 glass-subtle rounded-xl p-3">
                      <span className="font-semibold text-slate-800">Brief: </span>
                      {order.requirements}
                    </p>
                  )}

                  {order.deliveryNote && (
                    <p className="text-xs text-emerald-950 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3">
                      <span className="font-semibold">Delivery note: </span>
                      {order.deliveryNote}
                    </p>
                  )}
                </div>

                {/* Right Financial Breakdown & Actions */}
                <div className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-900/10 pt-4 lg:pt-0 lg:pl-6 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{isFree ? 'Free Peer Help' : 'Order Gross'}</span>
                      <span className="font-mono-num font-bold text-slate-900">{formatLkr(order.grossAmountLkr)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Platform Fee ({isFree ? '0%' : '25%'})</span>
                      <span className="font-mono-num font-semibold text-amber-700">
                        {formatLkr(order.platformFeeLkr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Seller Payout ({isFree ? '0%' : '75%'})</span>
                      <span className="font-mono-num font-semibold text-emerald-700">
                        {formatLkr(order.sellerPayoutLkr)}
                      </span>
                    </div>
                  </div>

                  {canDeliver && (
                    <div className="space-y-2 pt-2">
                      <input
                        type="text"
                        value={deliveryNotes[order.id] ?? ''}
                        onChange={(e) => setDeliveryNotes((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="Delivery link or note..."
                        aria-label={`Delivery note for ${order.id}`}
                        className="w-full px-3 py-1.5 text-xs glass-input rounded-xl"
                      />
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => void handleAction(order.id, 'delivered')}
                        className="w-full px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  )}

                  {canComplete && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => void handleAction(order.id, 'completed')}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
                    >
                      {isFree ? 'Confirm Free Help Completed' : 'Approve Delivery & Release 75%/25%'}
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => void handleAction(order.id, 'cancelled')}
                      className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 bg-white/70 border border-slate-200 hover:bg-white rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

## File: `src/components/FounderLedgerView.tsx`

```tsx
import { Download } from 'lucide-react';
import type { Order } from '../types/marketplace';
import { formatLkr, summarizePlatformRevenue } from '../utils/campusRules';

interface FounderLedgerViewProps {
  orders: Order[];
}

export function FounderLedgerView({ orders }: FounderLedgerViewProps) {
  const summary = summarizePlatformRevenue(orders);
  const maxCampusFee = Math.max(1, ...summary.byCampus.map((c) => c.platformFeeLkr));
  const maxCategoryFee = Math.max(1, ...summary.byCategory.map((c) => c.platformFeeLkr));

  const handleExportCsv = () => {
    const header = [
      'Order ID',
      'Service Title',
      'Category',
      'Buyer',
      'Buyer Campus',
      'Seller',
      'Seller Campus',
      'Gross LKR',
      'Platform 25% LKR',
      'Seller 75% LKR',
      'Status',
    ];
    const rows = orders.map((o) => [
      o.id,
      `"${o.gigTitle.replace(/"/g, '""')}"`,
      o.category,
      `"${o.buyerName.replace(/"/g, '""')}"`,
      o.buyerCampus,
      `"${o.sellerName.replace(/"/g, '""')}"`,
      o.sellerCampus,
      String(o.grossAmountLkr),
      String(o.platformFeeLkr),
      String(o.sellerPayoutLkr),
      o.status,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sliit-freelance-hub-25pct-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide">
            Platform Owner Console · Automated 25% Commission Split
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
            Founder 25% Revenue Ledger
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Real-time accounting across all SLIIT campuses. Every paid sale routes 25% to the platform owner and 75% to
            the student seller.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white/85 border border-white hover:bg-white rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* 4-Column Financial KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-600">Your 25% Realized Revenue</div>
          <div data-testid="ledger-realized-fee" className="mt-2 font-mono-num text-2xl font-bold text-amber-700">
            {formatLkr(summary.realizedPlatformFeeLkr)}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono-num">
            From {summary.completedOrdersCount} {summary.completedOrdersCount === 1 ? 'completed order' : 'completed orders'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-600">Pending 25% Escrow Fee</div>
          <div data-testid="ledger-pending-fee" className="mt-2 font-mono-num text-2xl font-bold text-[#0B1F3A]">
            {formatLkr(summary.pendingPlatformFeeLkr)}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono-num">
            Across {summary.pendingEscrowCount} {summary.pendingEscrowCount === 1 ? 'active order' : 'active orders'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-600">Realized Campus GMV (100%)</div>
          <div data-testid="ledger-realized-gross" className="mt-2 font-mono-num text-2xl font-bold text-slate-900">
            {formatLkr(summary.realizedGrossLkr)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Total settled student volume</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-600">Seller Payouts (75%)</div>
          <div data-testid="ledger-seller-payout" className="mt-2 font-mono-num text-2xl font-bold text-emerald-700">
            {formatLkr(summary.realizedSellerPayoutLkr)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Settled net to SLIIT sellers</div>
        </div>
      </div>

      {/* Campus & Category 25% Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">25% Commission by SLIIT Campus</h3>
          <div className="space-y-3">
            {summary.byCampus.map((row) => (
              <div key={row.campus} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {row.campus} ({row.orderCount} {row.orderCount === 1 ? 'order' : 'orders'})
                  </span>
                  <span className="font-mono-num font-semibold text-slate-900">
                    {formatLkr(row.platformFeeLkr)}
                  </span>
                </div>
                <div className="h-2 bg-slate-900/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B1F3A] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((row.platformFeeLkr / maxCampusFee) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">25% Commission by Category</h3>
          <div className="space-y-3">
            {summary.byCategory.map((row) => (
              <div key={row.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {row.category} ({row.orderCount} {row.orderCount === 1 ? 'order' : 'orders'})
                  </span>
                  <span className="font-mono-num font-semibold text-slate-900">
                    {formatLkr(row.platformFeeLkr)}
                  </span>
                </div>
                <div className="h-2 bg-slate-900/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((row.platformFeeLkr / maxCategoryFee) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Itemized Commission Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-900/10 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900">Itemized 25% Commission Transactions</h3>
          <span className="font-mono-num text-xs text-slate-500">{orders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 bg-white/40 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Seller (Campus)</th>
                <th className="py-3 px-4 text-right">Gross (100%)</th>
                <th className="py-3 px-4 text-right">Your Fee (25%)</th>
                <th className="py-3 px-4 text-right">Seller Net (75%)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/5 text-xs">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/50">
                  <td className="py-3 px-4 font-mono-num text-slate-600 whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">{order.gigTitle}</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {order.sellerName} · {order.sellerCampus}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-900 whitespace-nowrap">
                    {formatLkr(order.grossAmountLkr)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-semibold text-amber-700 whitespace-nowrap">
                    {formatLkr(order.platformFeeLkr)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-semibold text-emerald-700 whitespace-nowrap">
                    {formatLkr(order.sellerPayoutLkr)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap capitalize text-slate-700">
                    {order.status.replace('_', ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

```

## File: `src/components/CampusAiView.tsx`

```tsx
import { Bot, RotateCcw, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import type { UserProfile } from '../types/marketplace';
import { sanitizeTextInput } from '../utils/campusRules';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface CampusAiViewProps {
  currentUser: UserProfile | null;
  gigsCount: number;
  freeGigsCount: number;
  kuppiCount: number;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'model',
  text: 'Ayubowan! I am SLIIT Hub AI. Ask me about finding paid or free student services, joining Kuppi & Study Together groups, calculating the 25% / 75% payout split, or drafting a high-converting campus gig.',
};

const STARTER_PROMPTS = [
  'Which Free Peer Help & Kuppi sessions are available right now?',
  'If I sell a SLIIT gig for LKR 12,000, how does the 25% fee work?',
  'Write a clean gig title and 4 deliverables for a React + Spring Boot project.',
  'How does SLIIT Freelance Hub keep accounts and orders secure?',
];

export function CampusAiView({ currentUser, gigsCount, freeGigsCount, kuppiCount }: CampusAiViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (rawText: string) => {
    const clean = sanitizeTextInput(rawText, 1500);
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    const campusContext = `Active gigs: ${gigsCount} (${freeGigsCount} free peer help), Active Kuppi/Study sessions: ${kuppiCount}, Signed-in student: ${
      currentUser ? `${currentUser.displayName} (${currentUser.campus})` : 'Guest'
    }`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          campusContext,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !payload.reply) {
        throw new Error(payload.error || `Request failed with status ${res.status}.`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: payload.reply as string,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach SLIIT Hub AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Dedicated SLIIT Campus Assistant
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#0B1F3A]">SLIIT Hub AI Chatbot</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Ask in English or Singlish for gig pricing, Kuppi study guidance, deliverables, or campus security rules.
          </p>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setMessages([INITIAL_MESSAGE]);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 border border-white hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        )}
      </div>

      {/* Starter Prompt Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STARTER_PROMPTS.map((prompt) => (
          <motion.button
            key={prompt}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            disabled={loading}
            onClick={() => void sendMessage(prompt)}
            className="text-left px-4 py-3 text-xs font-medium text-slate-700 glass-card hover:bg-white rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </motion.button>
        ))}
      </div>

      {/* Chat Conversation Window */}
      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col">
        <div
          data-testid="ai-messages"
          className="p-5 sm:p-6 space-y-4 max-h-[460px] min-h-[300px] overflow-y-auto"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'bg-white/85 border border-white text-slate-800 shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-[#0B1F3A]/85 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <span className="glass-subtle px-4 py-2.5 rounded-2xl">SLIIT Hub AI is thinking...</span>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            data-testid="ai-error"
            className="mx-5 mb-3 p-3 bg-red-50/95 border border-red-200 rounded-xl text-xs font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-900/10 bg-white/45 flex items-center gap-3">
          <label htmlFor="campus-ai-input" className="sr-only">
            Ask SLIIT Hub AI
          </label>
          <input
            id="campus-ai-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SLIIT gigs, Free Help, Kuppi sessions, or 25% payout..."
            className="flex-1 px-4 py-3 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

```

## File: `src/components/MyProfileView.tsx`

```tsx
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

```

## File: `src/components/StudentProfileModal.tsx`

```tsx
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

```

## File: `src/components/CampusGateModal.tsx`

```tsx
import { Award, Lock, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import {
  CAMPUS_BRANCHES,
  SLIIT_FACULTIES,
  type CampusBranch,
  type SliitFaculty,
  type StudentProfileStats,
  type UserProfile,
} from '../types/marketplace';
import {
  FOUNDER_ADMIN_EMAIL,
  sanitizeTextInput,
  validateSliitEmail,
  validateSliitStudentId,
} from '../utils/campusRules';
import { AchievementBadgeChip } from './AchievementBadgeChip';

interface CampusGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  profileStats: StudentProfileStats | null;
  authEmail: string | null;
  isFirebaseAuthenticated: boolean;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onVerifyCampusProfile: (profile: Omit<UserProfile, 'uid' | 'createdAtMs'>) => Promise<void>;
  onEnterDemoStudent: (asFounder?: boolean) => void;
  onOpenFullProfile: () => void;
}

export function CampusGateModal({
  isOpen,
  onClose,
  currentUser,
  profileStats,
  authEmail,
  isFirebaseAuthenticated,
  onGoogleSignIn,
  onSignOut,
  onVerifyCampusProfile,
  onEnterDemoStudent,
  onOpenFullProfile,
}: CampusGateModalProps) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [sliitEmail, setSliitEmail] = useState(currentUser?.sliitEmail ?? '');
  const [sliitStudentId, setSliitStudentId] = useState(currentUser?.sliitStudentId ?? '');
  const [campus, setCampus] = useState<CampusBranch>(currentUser?.campus ?? 'Malabe');
  const [faculty, setFaculty] = useState<SliitFaculty>(currentUser?.faculty ?? 'Computing');
  const [batch, setBatch] = useState(currentUser?.batch ?? 'Y3S2');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = sanitizeTextInput(displayName, 80);
    if (trimmedName.length < 2) {
      setError('Enter your full student name (at least 2 characters).');
      return;
    }

    const emailCheck = validateSliitEmail(sliitEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Only @my.sliit.lk or @sliit.lk emails are permitted.');
      return;
    }

    const idCheck = validateSliitStudentId(sliitStudentId);
    if (!idCheck.valid) {
      setError(idCheck.error || 'Enter a valid SLIIT registration number.');
      return;
    }

    setSubmitting(true);
    try {
      // Server-side SLIIT campus verification check (enforced via Express security gate)
      const res = await fetch('/api/security/verify-campus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailCheck.normalized,
          studentId: idCheck.normalized,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Campus security verification failed.');
      }

      await onVerifyCampusProfile({
        displayName: trimmedName,
        sliitEmail: emailCheck.normalized,
        sliitStudentId: idCheck.normalized,
        campus,
        faculty,
        batch: sanitizeTextInput(batch, 16) || 'Y3S1',
        role: 'student',
        verifiedCampus: true,
        isFounderAdmin: authEmail === FOUNDER_ADMIN_EMAIL,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save SLIIT verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-gate-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-white/90 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/aistudio/image_904ea47c.png"
                  alt="SLIIT Freelance Hub emblem"
                  className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-white shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-amber-700 tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Hardened SLIIT Campus-Only Gate
                  </p>
                  <h2 id="campus-gate-title" className="mt-0.5 font-display text-2xl font-bold text-slate-900">
                    {currentUser ? 'Verified SLIIT Member' : 'Verify Your SLIIT Student Access'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close verification modal"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          SLIIT Freelance Hub is protected by dual client + server domain verification, rate limiting, and Firestore
          RBAC rules. Only <span className="font-mono-num font-medium">@my.sliit.lk</span> /{' '}
          <span className="font-mono-num font-medium">@sliit.lk</span> student accounts can post services, join Kuppi
          sessions, or place orders.
        </p>

        {/* Google Sign-In Status */}
        <div className="mt-5 p-4 glass-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-slate-500">Cloud Session</div>
            <div className="text-sm font-medium text-slate-900">
              {isFirebaseAuthenticated && authEmail
                ? `Signed in as ${authEmail}`
                : 'Not signed into Google Auth'}
            </div>
          </div>
          {isFirebaseAuthenticated ? (
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onGoogleSignIn()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {/* Signed-in Student Badges Summary */}
        {currentUser && profileStats && (
          <div className="mt-4 p-4 glass-subtle rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
                <Award className="w-4 h-4 text-amber-600" />
                <span>
                  Your Achievement Badges ({profileStats.earnedBadges.length}/{profileStats.badges.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullProfile();
                }}
                className="text-xs font-semibold text-[#0B1F3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                View All Badges
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileStats.earnedBadges.map((badge) => (
                <AchievementBadgeChip key={badge.id} badge={badge} variant="compact" />
              ))}
            </div>
            <div className="font-mono-num text-[11px] text-slate-600">
              {profileStats.totalCompletedOrders} completed orders · {profileStats.kuppiHostedCount} Kuppi hosted ·{' '}
              {profileStats.kuppiAttendedCount} sessions attended
            </div>
          </div>
        )}

        {/* SLIIT Campus Verification Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="sliit-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Student Full Name
            </label>
            <input
              id="sliit-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Kavindu Perera"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sliit-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SLIIT Campus Email
              </label>
              <input
                id="sliit-email"
                type="email"
                value={sliitEmail}
                onChange={(e) => setSliitEmail(e.target.value)}
                placeholder="IT21849210@my.sliit.lk"
                className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                required
              />
            </div>

            <div>
              <label htmlFor="sliit-id" className="block text-xs font-semibold text-slate-700 mb-1.5">
                SLIIT Registration No.
              </label>
              <input
                id="sliit-id"
                type="text"
                value={sliitStudentId}
                onChange={(e) => setSliitStudentId(e.target.value.toUpperCase())}
                placeholder="IT21849210"
                className="w-full px-3.5 py-2.5 text-sm font-mono-num glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="sliit-campus" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus
              </label>
              <select
                id="sliit-campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value as CampusBranch)}
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              >
                {CAMPUS_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sliit-faculty" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Faculty
              </label>
              <select
                id="sliit-faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value as SliitFaculty)}
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              >
                {SLIIT_FACULTIES.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sliit-batch" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Year / Semester
              </label>
              <input
                id="sliit-batch"
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Y3S2"
                className="w-full px-3 py-2.5 text-sm glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {submitting ? 'Verifying Campus ID...' : 'Verify SLIIT Student Access'}
          </button>
        </form>

        {/* Instant Sandbox / Preview Options */}
        <div className="mt-6 pt-5 border-t border-slate-900/10">
          <p className="text-xs font-medium text-slate-500">
            Testing without a Google popup? Enter an instant verified campus sandbox session:
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                onEnterDemoStudent(false);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white/80 border border-slate-200 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Use Student Sandbox (IT21849210)
            </button>
            <button
              type="button"
              onClick={() => {
                onEnterDemoStudent(true);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              Preview Founder Admin (25% Owner)
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

## File: `src/components/AchievementBadgeChip.tsx`

```tsx
import { Award, CheckCircle2, Flame, GraduationCap, HeartHandshake, Lock, ShieldCheck } from 'lucide-react';
import type { AchievementBadge, AchievementBadgeId } from '../types/marketplace';

interface AchievementBadgeChipProps {
  badge: AchievementBadge;
  variant?: 'compact' | 'card';
}

function BadgeIcon({ id, className }: { id: AchievementBadgeId; className?: string }) {
  switch (id) {
    case 'top_rated_seller':
      return <Award className={className} />;
    case 'kuppi_master':
      return <GraduationCap className={className} />;
    case 'verified_closer':
      return <CheckCircle2 className={className} />;
    case 'study_streak':
      return <Flame className={className} />;
    case 'free_mentor':
      return <HeartHandshake className={className} />;
    case 'campus_verified':
      return <ShieldCheck className={className} />;
  }
}

const TIER_STYLES: Record<
  AchievementBadge['tier'],
  { surface: string; medallion: string; title: string; progress: string }
> = {
  gold: {
    surface: 'bg-amber-50/90 border-amber-300/80',
    medallion: 'bg-amber-500 text-white shadow-xs',
    title: 'text-amber-950',
    progress: 'text-amber-800',
  },
  navy: {
    surface: 'bg-slate-100/90 border-slate-300/80',
    medallion: 'bg-[#0B1F3A] text-white shadow-xs',
    title: 'text-[#0B1F3A]',
    progress: 'text-slate-700',
  },
  emerald: {
    surface: 'bg-emerald-50/90 border-emerald-300/80',
    medallion: 'bg-emerald-700 text-white shadow-xs',
    title: 'text-emerald-950',
    progress: 'text-emerald-800',
  },
  sky: {
    surface: 'bg-sky-50/90 border-sky-300/80',
    medallion: 'bg-sky-700 text-white shadow-xs',
    title: 'text-sky-950',
    progress: 'text-sky-800',
  },
};

export function AchievementBadgeChip({ badge, variant = 'compact' }: AchievementBadgeChipProps) {
  const palette = TIER_STYLES[badge.tier];

  if (variant === 'compact') {
    return (
      <span
        title={`${badge.label} — ${badge.progressLabel}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap shrink-0 ${
          badge.earned ? `${palette.surface} ${palette.title}` : 'bg-white/60 border-slate-200 text-slate-500'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-md inline-flex items-center justify-center shrink-0 ${
            badge.earned ? palette.medallion : 'bg-slate-200 text-slate-500'
          }`}
        >
          <BadgeIcon id={badge.id} className="w-2.5 h-2.5" />
        </span>
        <span>{badge.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-colors ${
        badge.earned
          ? palette.surface
          : 'bg-white/45 border-slate-200/80 opacity-80'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          badge.earned ? palette.medallion : 'bg-slate-200/80 text-slate-500'
        }`}
      >
        {badge.earned ? <BadgeIcon id={badge.id} className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className={`text-sm font-bold leading-snug ${badge.earned ? palette.title : 'text-slate-700'}`}>
            {badge.label}
          </div>
          <span
            className={`font-mono-num text-[11px] font-semibold whitespace-nowrap shrink-0 ${
              badge.earned ? palette.progress : 'text-slate-500'
            }`}
          >
            {badge.earned ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{badge.description}</p>
        <div
          className={`mt-1.5 font-mono-num text-[11px] font-semibold ${
            badge.earned ? palette.progress : 'text-slate-500'
          }`}
        >
          {badge.progressLabel}
        </div>
      </div>
    </div>
  );
}

```

## File: `src/components/ErrorBoundary.tsx`

```tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'An unexpected error occurred.' };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              The application encountered an unexpected data or permission error. You can reload to restore your session.
            </p>
            <p className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-[#0B1F3A] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

```

