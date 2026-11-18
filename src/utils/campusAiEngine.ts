import { calculateCommissionSplit } from './campusRules';

export interface BotContext {
  currentUser?: { displayName?: string; campus?: string; studentId?: string } | null;
  gigsCount?: number;
  freeGigsCount?: number;
  kuppiCount?: number;
}

/**
 * Intelligent Campus AI knowledge & responder engine.
 * Delivers comprehensive answers in clear, professional English.
 */
export function generateLocalCampusAnswer(query: string, _context?: BotContext): string {
  const q = query.trim().toLowerCase();

  // 1. Commission / Payout / Fee Calculation
  if (
    q.includes('25%') ||
    q.includes('fee') ||
    q.includes('commission') ||
    q.includes('payout') ||
    q.includes('salli') ||
    q.includes('earnings') ||
    q.includes('percentage') ||
    q.includes('cut') ||
    q.includes('split')
  ) {
    const match = query.match(/(\d[\d,.]*)/);
    let sampleAmount = 10000;
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0 && parsed <= 1000000) {
        sampleAmount = parsed;
      }
    }
    const split = calculateCommissionSplit(sampleAmount);

    return `💰 **SLIIT Freelance Hub Commission & Payout Structure:**

For any paid student service on the Hub:
- **Seller Payout (75%):** **LKR ${split.sellerPayoutLkr.toLocaleString()}** goes directly to you as the student seller.
- **Platform Fee (25%):** **LKR ${split.platformFeeLkr.toLocaleString()}** funds student escrow protection, campus verification, and platform infrastructure.
- **Total Order Value:** LKR ${split.grossAmountLkr.toLocaleString()}

🌟 **Free Peer Help & Kuppi Sessions:**
- **100% Free (LKR 0)**. There are zero platform commissions or fees on free peer services!

🔒 **Escrow Protection:** Buyer payment is securely held by the Hub and released to the seller only after the buyer confirms satisfactory delivery.`;
  }

  // 2. Kuppi & Study Sessions
  if (
    q.includes('kuppi') ||
    q.includes('study together') ||
    q.includes('revision') ||
    q.includes('exam') ||
    q.includes('class') ||
    q.includes('past paper') ||
    q.includes('module')
  ) {
    return `🎓 **SLIIT Kuppi & Study Sessions Guidance:**

Kuppi sessions are student-led, peer-to-peer revision classes created to help batchmates master key coursework and prepare for exams.

- **How to Join:**
  Go to the **"Kuppi & Study"** tab in the top navigation. Browse active sessions filtered by campus and module, and click **"Join Kuppi Session"**.
- **How to Host a Session:**
  Click **"Host a Session"** to create a free revision group for any module (DSA, OOP, ITP, MAD, DBMS, Engineering Mathematics).
- **Core Guidelines:**
  - All Kuppi sessions are completely **FREE** of charge.
  - Sessions can be held virtually (Zoom/Teams links) or on-campus (Malabe Main Library, Open Canteen, Study Gazebos).
  - Sessions focus on conceptual understanding, past exam walkthroughs, and lab exercises.`;
  }

  // 3. Selling / Posting Gigs
  if (
    q.includes('sell') ||
    q.includes('create gig') ||
    q.includes('post gig') ||
    q.includes('freelance') ||
    q.includes('service') ||
    q.includes('earn') ||
    q.includes('hire')
  ) {
    return `🚀 **How to Publish a Freelance Service on SLIIT Hub:**

1. Navigate to the **"Sell & Free"** tab in the navigation menu.
2. Complete your service listing details:
   - **Title:** Actionable and specific (e.g., *"Fullstack React & Node.js Web Application Development"*).
   - **Category:** Choose from Web Development, Mobile Apps, UI/UX Design, Academic LaTeX, Data/AI, or Motion Graphics.
   - **Pricing:** Set your price from LKR 500 to LKR 500,000, or check **"Free Peer Help"** to offer volunteer assistance.
   - **Deliverables:** Provide 3-5 concrete deliverables (e.g., Source Code, Deployment, Documentation).
3. Click Publish! Your service will appear on the student marketplace immediately.

💡 **Pro Tip:** Adding portfolio links (GitHub repositories, Figma prototypes) significantly increases student order requests!`;
  }

  // 4. Verification / Campus Gate / Security
  if (
    q.includes('verify') ||
    q.includes('gate') ||
    q.includes('email') ||
    q.includes('sliit.lk') ||
    q.includes('security') ||
    q.includes('student id') ||
    q.includes('fake') ||
    q.includes('safe')
  ) {
    return `🛡️ **SLIIT Hub Security & Identity Verification:**

- **Exclusive to SLIIT Students:**
  Access is strictly restricted to enrolled SLIIT students with a valid **@my.sliit.lk** or **@sliit.lk** university email and student ID (e.g., \`IT21xxxxxx\`, \`BM22xxxxxx\`, \`EN20xxxxxx\`).
- **Escrow-Backed Protection:**
  When a student places an order, payment is safely held in escrow. Funds are transferred to the seller only when delivery is verified and accepted.
- **Verified Badges:**
  Verified student profiles display trust badges based on completed orders and ratings.`;
  }

  // 5. SLIIT Campuses & Facilities
  if (
    q.includes('malabe') ||
    q.includes('metro') ||
    q.includes('kandy') ||
    q.includes('matara') ||
    q.includes('kurunegala') ||
    q.includes('jaffna') ||
    q.includes('campus') ||
    q.includes('library') ||
    q.includes('lms') ||
    q.includes('eduscope')
  ) {
    return `🏛️ **SLIIT Campus Network & Portals:**

- **Main Campus - Malabe:**
  - Faculties: Computing (FOC), Engineering (FOE), Business (SLIIT Business School), Humanities & Sciences.
  - Facilities: Multi-story University Library, Cafeteria, Sports Complex, Student Study Areas.
- **Metropolitan Campus:**
  - BOC Merchant Tower, St. Michael's Road, Colombo 03.
- **Regional Campuses & Centers:**
  - **Kandy Uni:** William Gopallawa Mawatha, Kandy.
  - **Matara Center:** Broadway, Matara.
  - **Kurunegala Center:** Mihindu Mawatha, Kurunegala.
  - **Northern Center:** Jaffna.
- **Digital Systems:**
  - **LMS (CourseWeb):** Access lecture notes, lab tutorial sheets, and submit assignments.
  - **Eduscope:** View recorded lectures and session archives.`;
  }

  // 6. Coding & Technical Support
  if (
    q.includes('react') ||
    q.includes('node') ||
    q.includes('spring boot') ||
    q.includes('java') ||
    q.includes('python') ||
    q.includes('dsa') ||
    q.includes('sql') ||
    q.includes('git') ||
    q.includes('bug') ||
    q.includes('code') ||
    q.includes('programming')
  ) {
    return `💻 **Technical & Software Development Assistance:**

- **Frontend (React + Vite + Tailwind CSS):**
  - Keep UI components small and composable inside \`src/components/\`.
  - Use modular styling and state hooks (\`useState\`, \`useMemo\`, \`useCallback\`).
- **Backend (Node.js Express / Java Spring Boot):**
  - Separate routes, controllers, and services.
  - Enforce input sanitization, rate limiting, and CORS headers.
- **Databases & Cloud (Firebase / MySQL / PostgreSQL):**
  - Always validate relational foreign keys and maintain server-side authorization.
- **Git & Collaboration:**
  - Use descriptive branch names: \`feature/feature-name\` or \`fix/issue-description\`.
  - Write clear commit messages and review pull requests before merging.

Feel free to paste your specific code snippet or error message for step-by-step troubleshooting!`;
  }

  // 7. Greetings
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'machan' ||
    q === 'ayubowan' ||
    q === 'halo' ||
    q === 'yo' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ')
  ) {
    return `👋 **Hello! I am your SLIIT Campus AI Bot!** 🤖

I am here to assist you with everything related to the SLIIT Freelance Hub and university academics:
- 🎓 Finding or hosting **Free Kuppi & Study Together** sessions
- 💰 Calculating the **25% platform fee & 75% seller payout**
- 🚀 Publishing high-converting **freelance services & deliverables**
- 💻 Software development guidance (React, Java, Spring Boot, DSA, Python)
- 🛡️ Student identity verification and escrow security

What would you like to explore today?`;
  }

  // 8. General Comprehensive Fallback
  return `🤖 **SLIIT Campus Bot:**

Regarding your question: **"${query}"**

- **Campus Freelance Marketplace:** Connect with fellow SLIIT students across Malabe, Metro, Kandy, Matara, Kurunegala, and Jaffna to buy and sell university-oriented services.
- **Kuppi & Study Groups:** Browse the **Kuppi & Study** section to join or schedule free peer revision sessions for your modules.
- **Fair Financial Model:** 75% payout to student sellers, 25% platform escrow fee, and 0% fee on all free peer help.
- **Need More Details?** Feel free to ask about specific modules (DSA, OOP, SE, Web), service pricing calculations, or campus locations!`;
}
