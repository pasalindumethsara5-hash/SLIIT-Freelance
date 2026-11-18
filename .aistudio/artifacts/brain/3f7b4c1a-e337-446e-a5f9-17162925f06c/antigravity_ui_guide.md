# SLIIT Freelance Hub — Antigravity UI Export & Setup Guide

## Method 1: Full App Import into Antigravity (Recommended)
1. Click **Download App (ZIP)** in the AI Studio toolbar (or export to GitHub).
2. Extract the ZIP folder on your computer.
3. Open **Antigravity** -> **File → Open Folder...** -> select the extracted folder.
4. Run in Antigravity Terminal:
   ```bash
   npm install
   npm run dev
   ```
   The app will start on `http://localhost:3000`.

---

## Method 2: Copy UI Files Only into an Existing Antigravity React + Vite Project

### 1. Install Required UI Packages
```bash
npm install react react-dom lucide-react motion
npm install -D @tailwindcss/vite tailwindcss
```

### 2. Copy These UI Files & Folders
- **Entry & Theme**:
  - `index.html` (Fonts: Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono + `<body class="glass-canvas">`)
  - `src/index.css` (Tailwind CSS v4 + Frosted Glass UI classes)
  - `src/main.tsx`
  - `src/App.tsx`
- **UI Components (`src/components/`)**:
  - `TopNav.tsx` — Frosted glass navbar, SF emblem, animated sliding tab indicator (`layoutId`), mobile drawer
  - `MarketplaceView.tsx` — Hero with SLIIT Malabe HD photo, pricing tier tabs, `#campus-filter` dropdown, category tabs, service grid + matched Kuppi/Study preview
  - `GigCard.tsx` — Service card with animated hover lift, badges, and LKR / FREE pricing
  - `GigDetailModal.tsx` — Service detail & 25%/75% escrow breakdown modal
  - `KuppiStudyView.tsx` — Kuppi & Study Together sessions, seat booking, invite copy, host form
  - `SellServiceView.tsx` — Paid (25% fee calculator) & Free Peer Help service publisher
  - `OrdersView.tsx` — Buyer/seller campus order tracking
  - `FounderLedgerView.tsx` — 25% platform commission revenue ledger
  - `CampusAiView.tsx` — SLIIT Campus AI assistant interface
  - `MyProfileView.tsx` — Dedicated student profile, 4 KPIs, Achievement Badges, and campus quick filter
  - `StudentProfileModal.tsx` — Peer profile & badge showcase dialog
  - `CampusGateModal.tsx` — `@my.sliit.lk` / `@sliit.lk` verification & student sandbox modal
  - `AchievementBadgeChip.tsx` — Visual student achievement badges (`Top Rated Seller`, `Kuppi Master`, etc.)
  - `ErrorBoundary.tsx` — Graceful runtime error fallback
- **Data, Types & Pure Rules**:
  - `src/types/marketplace.ts`
  - `src/data/seedData.ts`
  - `src/utils/campusRules.ts`
- **Visual Assets**:
  - `src/assets/images/sliit_malabe_hd.jpg`
  - `src/assets/images/sliit_hub_emblem.png`
  - `src/assets/images/gig_*.jpg`
  - `public/assets/aistudio/image_904ea47c.png`

> Note: If you copy only the UI into a project **without** Firebase/Express (`src/services/firebaseClient.ts` & `server.ts`), stub or remove the Firebase imports in `src/App.tsx` and the `/api/chat` & `/api/security/verify-campus` fetch calls in `CampusAiView.tsx` / `CampusGateModal.tsx` so the UI runs 100% client-side with `SEED_GIGS`, `SEED_KUPPI_SESSIONS`, and `SEED_ORDERS`.

---

## Core Theme CSS (`src/index.css`)
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
