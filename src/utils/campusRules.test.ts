import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCommissionSplit,
  calculateGrossFromDesiredPayout,
  canTransitionOrderStatus,
  computeStudentProfileStats,
  filterGigs,
  filterKuppiSessions,
  formatKuppiInviteText,
  sanitizeTextInput,
  summarizePlatformRevenue,
  validateGigInput,
  validateKuppiInput,
  validateSliitEmail,
  validateSliitStudentId,
} from './campusRules';
import type { Gig, KuppiSession, Order } from '../types/marketplace';

test('validateSliitEmail allows only @my.sliit.lk and @sliit.lk domains', () => {
  assert.equal(validateSliitEmail('IT21849210@my.sliit.lk').valid, true);
  assert.equal(validateSliitEmail('lecturer.name@sliit.lk').valid, true);
  assert.equal(validateSliitEmail('  it22100455@MY.SLIIT.LK ').normalized, 'it22100455@my.sliit.lk');

  assert.equal(validateSliitEmail('student@gmail.com').valid, false);
  assert.equal(validateSliitEmail('hacker@my.sliit.lk.evil.com').valid, false);
  assert.equal(validateSliitEmail('').valid, false);
});

test('validateSliitStudentId validates official faculty prefixes and 8 digits', () => {
  assert.equal(validateSliitStudentId('it21849210').valid, true);
  assert.equal(validateSliitStudentId('it21849210').normalized, 'IT21849210');
  assert.equal(validateSliitStudentId('EN22401122').valid, true);
  assert.equal(validateSliitStudentId('BM20112233').valid, true);

  assert.equal(validateSliitStudentId('XX21849210').valid, false);
  assert.equal(validateSliitStudentId('IT21849').valid, false);
});

test('calculateCommissionSplit enforces exact 25% fee on paid and 0% on free services', () => {
  const freeSplit = calculateCommissionSplit(0);
  assert.equal(freeSplit.platformFeeRate, 0);
  assert.equal(freeSplit.platformFeeLkr, 0);
  assert.equal(freeSplit.sellerPayoutLkr, 0);

  const split1 = calculateCommissionSplit(10000);
  assert.equal(split1.platformFeeRate, 0.25);
  assert.equal(split1.platformFeeLkr, 2500);
  assert.equal(split1.sellerPayoutLkr, 7500);
  assert.equal(split1.platformFeeLkr + split1.sellerPayoutLkr, split1.grossAmountLkr);

  const split2 = calculateCommissionSplit(3333);
  assert.equal(split2.platformFeeLkr, 833);
  assert.equal(split2.sellerPayoutLkr, 2500);
  assert.equal(split2.platformFeeLkr + split2.sellerPayoutLkr, 3333);
});

test('calculateGrossFromDesiredPayout computes customer price so seller nets desired 75%', () => {
  const split = calculateGrossFromDesiredPayout(7500);
  assert.equal(split.grossAmountLkr, 10000);
  assert.equal(split.platformFeeLkr, 2500);
  assert.equal(split.sellerPayoutLkr, 7500);
});

test('canTransitionOrderStatus enforces strict buyer/seller lifecycle and terminal locks', () => {
  assert.equal(canTransitionOrderStatus('in_progress', 'delivered', 'seller'), true);
  assert.equal(canTransitionOrderStatus('in_progress', 'completed', 'seller'), false);
  assert.equal(canTransitionOrderStatus('delivered', 'completed', 'buyer'), true);
  assert.equal(canTransitionOrderStatus('in_progress', 'cancelled', 'buyer'), true);
  assert.equal(canTransitionOrderStatus('completed', 'in_progress', 'buyer'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'delivered', 'seller'), false);
});

test('summarizePlatformRevenue separates realized vs pending 25% commission and excludes cancelled', () => {
  const orders: Order[] = [
    {
      id: 'ord-1',
      gigId: 'gig-1',
      gigTitle: 'React Campus Portal',
      category: 'Software & Web',
      buyerId: 'b1',
      buyerName: 'Nethmi',
      buyerCampus: 'Malabe',
      sellerId: 's1',
      sellerName: 'Kasun',
      sellerCampus: 'Malabe',
      grossAmountLkr: 10000,
      platformFeeRate: 0.25,
      platformFeeLkr: 2500,
      sellerPayoutLkr: 7500,
      requirements: 'Need portal',
      deliveryNote: 'Done',
      status: 'completed',
      createdAtMs: 1000,
      updatedAtMs: 2000,
    },
    {
      id: 'ord-2',
      gigId: 'gig-2',
      gigTitle: 'Figma Mobile UI',
      category: 'UI/UX & Figma',
      buyerId: 'b2',
      buyerName: 'Tharindu',
      buyerCampus: 'Kandy',
      sellerId: 's2',
      sellerName: 'Dilshan',
      sellerCampus: 'Metro',
      grossAmountLkr: 8000,
      platformFeeRate: 0.25,
      platformFeeLkr: 2000,
      sellerPayoutLkr: 6000,
      requirements: 'Wireframes',
      deliveryNote: '',
      status: 'in_progress',
      createdAtMs: 1500,
      updatedAtMs: 1500,
    },
    {
      id: 'ord-3',
      gigId: 'gig-3',
      gigTitle: 'Cancelled Deck',
      category: 'Business & Decks',
      buyerId: 'b3',
      buyerName: 'Amaya',
      buyerCampus: 'Matara',
      sellerId: 's3',
      sellerName: 'Ravindu',
      sellerCampus: 'Matara',
      grossAmountLkr: 4000,
      platformFeeRate: 0.25,
      platformFeeLkr: 1000,
      sellerPayoutLkr: 3000,
      requirements: 'Slides',
      deliveryNote: '',
      status: 'cancelled',
      createdAtMs: 1600,
      updatedAtMs: 1700,
    },
  ];

  const summary = summarizePlatformRevenue(orders);
  assert.equal(summary.completedOrdersCount, 1);
  assert.equal(summary.pendingEscrowCount, 1);
  assert.equal(summary.cancelledOrdersCount, 1);
  assert.equal(summary.realizedGrossLkr, 10000);
  assert.equal(summary.realizedPlatformFeeLkr, 2500);
  assert.equal(summary.realizedSellerPayoutLkr, 7500);
  assert.equal(summary.pendingGrossLkr, 8000);
  assert.equal(summary.pendingPlatformFeeLkr, 2000);
  assert.equal(summary.pendingSellerPayoutLkr, 6000);
});

test('filterGigs supports free vs paid tier filtering, campus, category, and query', () => {
  const gigs: Gig[] = [
    {
      id: 'g1',
      sellerId: 's1',
      sellerName: 'Kavindu Perera',
      sellerSliitId: 'IT21849210',
      sellerCampus: 'Malabe',
      sellerFaculty: 'Computing',
      title: 'Full-Stack MERN Project Architecture & Deployment',
      description: 'Complete backend and React frontend setup for Y3S2 projects.',
      category: 'Software & Web',
      isFree: false,
      priceLkr: 12000,
      platformFeeLkr: 3000,
      sellerPayoutLkr: 9000,
      deliveryDays: 4,
      revisions: 2,
      deliverables: ['Source repo', 'Docker setup'],
      imageUrl: '/img1.jpg',
      rating: 4.9,
      reviewCount: 14,
      status: 'active',
      createdAtMs: 100,
    },
    {
      id: 'g2',
      sellerId: 's2',
      sellerName: 'Senuri Jayawardena',
      sellerSliitId: 'IT22104422',
      sellerCampus: 'Metro',
      sellerFaculty: 'Computing',
      title: 'Free Git & GitHub Merge Conflict Help for Year 1',
      description: 'Volunteer 30-minute peer help to untangle Git branches and PRs.',
      category: 'Free Peer Help',
      isFree: true,
      priceLkr: 0,
      platformFeeLkr: 0,
      sellerPayoutLkr: 0,
      deliveryDays: 1,
      revisions: 1,
      deliverables: ['Live screen-share walkthrough'],
      imageUrl: '/img2.jpg',
      rating: 5.0,
      reviewCount: 9,
      status: 'active',
      createdAtMs: 200,
    },
  ];

  const onlyFree = filterGigs(gigs, {
    query: '',
    category: 'All',
    campus: 'All',
    pricingTier: 'free',
    sortBy: 'recommended',
  });
  assert.equal(onlyFree.length, 1);
  assert.equal(onlyFree[0].id, 'g2');

  const onlyPaid = filterGigs(gigs, {
    query: '',
    category: 'All',
    campus: 'All',
    pricingTier: 'paid',
    sortBy: 'recommended',
  });
  assert.equal(onlyPaid.length, 1);
  assert.equal(onlyPaid[0].id, 'g1');
});

test('validateGigInput handles both free community gigs and paid bounds', () => {
  const freeGood = validateGigInput({
    title: 'Free Java OOP Debugging Session for Freshers',
    description: 'Volunteer 1-on-1 debugging session for SLIIT Y1S2 Java assignments and Eclipse/IntelliJ setup.',
    category: 'Free Peer Help',
    isFree: true,
    priceLkr: 0,
    deliveryDays: 1,
    revisions: 1,
    deliverables: ['30-min call'],
  });
  assert.equal(freeGood.valid, true);

  const badPaid = validateGigInput({
    title: 'Short',
    description: 'Too short',
    category: 'Invalid',
    isFree: false,
    priceLkr: 100,
    deliveryDays: 0,
    revisions: 2,
    deliverables: [],
  });
  assert.equal(badPaid.valid, false);
  assert.ok(badPaid.errors.title);
  assert.ok(badPaid.errors.priceLkr);
});

test('Kuppi & Study Group validation, filtering, invite text, and XSS sanitization', () => {
  const badKuppi = validateKuppiInput({
    sessionType: 'study_group',
    moduleCode: 'IT2070',
    title: 'DSA Study Group',
    topicSummary: 'Revising trees and graphs before midterms.',
    mode: 'On-Campus',
    locationOrLink: 'Malabe Library Floor 3',
    scheduleLabel: 'Fri 4:00 PM',
    priceLkr: 500,
    maxSeats: 10,
  });
  assert.equal(badKuppi.valid, false);
  assert.ok(badKuppi.errors.priceLkr);

  const session: KuppiSession = {
    id: 'k1',
    hostId: 'h1',
    hostName: 'Kavindu',
    hostSliitId: 'IT21849210',
    hostCampus: 'Malabe',
    sessionType: 'kuppi',
    moduleCode: 'IT2070',
    title: 'DSA Binary Trees & Dijkstra Kuppi',
    topicSummary: 'Step-by-step past paper walkthrough.',
    mode: 'On-Campus',
    locationOrLink: 'Hall A502',
    scheduleLabel: 'Thu 5:30 PM',
    priceLkr: 0,
    platformFeeLkr: 0,
    sellerPayoutLkr: 0,
    maxSeats: 30,
    attendeeIds: ['u1'],
    status: 'open',
    createdAtMs: 100,
  };

  assert.equal(
    filterKuppiSessions([session], { query: 'IT2070', sessionType: 'kuppi', campus: 'Malabe' }).length,
    1
  );
  assert.ok(formatKuppiInviteText(session).includes('[IT2070]'));
  assert.equal(sanitizeTextInput('<script>alert(1)</script>Hello'), 'scriptalert(1)/scriptHello');
});

test('computeStudentProfileStats unlocks Top Rated Seller, Kuppi Master, Verified Closer, and Study Streak based on orders and attendance', () => {
  const gigs: Gig[] = [
    {
      id: 'g-paid',
      sellerId: 'stu-1',
      sellerName: 'Dilshan Rodrigo',
      sellerSliitId: 'IT20784120',
      sellerCampus: 'Malabe',
      sellerFaculty: 'Computing',
      title: 'Full-Stack React Build',
      description: 'End-to-end React web app.',
      category: 'Software & Web',
      isFree: false,
      priceLkr: 10000,
      platformFeeLkr: 2500,
      sellerPayoutLkr: 7500,
      deliveryDays: 3,
      revisions: 2,
      deliverables: ['Source code'],
      imageUrl: '/img.jpg',
      rating: 4.9,
      reviewCount: 15,
      status: 'active',
      createdAtMs: 100,
    },
    {
      id: 'g-free',
      sellerId: 'stu-1',
      sellerName: 'Dilshan Rodrigo',
      sellerSliitId: 'IT20784120',
      sellerCampus: 'Malabe',
      sellerFaculty: 'Computing',
      title: 'Free Git Branch Help',
      description: 'Peer mentoring on Git workflows.',
      category: 'Free Peer Help',
      isFree: true,
      priceLkr: 0,
      platformFeeLkr: 0,
      sellerPayoutLkr: 0,
      deliveryDays: 1,
      revisions: 1,
      deliverables: ['Call'],
      imageUrl: '/img2.jpg',
      rating: 5.0,
      reviewCount: 10,
      status: 'active',
      createdAtMs: 120,
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord-100',
      gigId: 'g-paid',
      gigTitle: 'Full-Stack React Build',
      category: 'Software & Web',
      buyerId: 'stu-2',
      buyerName: 'Dineth Gunasekara',
      buyerCampus: 'Malabe',
      sellerId: 'stu-1',
      sellerName: 'Dilshan Rodrigo',
      sellerCampus: 'Malabe',
      grossAmountLkr: 10000,
      platformFeeRate: 0.25,
      platformFeeLkr: 2500,
      sellerPayoutLkr: 7500,
      requirements: 'Build portal',
      deliveryNote: 'Done',
      status: 'completed',
      createdAtMs: 200,
      updatedAtMs: 300,
    },
  ];

  const kuppiSessions: KuppiSession[] = [
    {
      id: 'k-host',
      hostId: 'stu-1',
      hostName: 'Dilshan Rodrigo',
      hostSliitId: 'IT20784120',
      hostCampus: 'Malabe',
      sessionType: 'kuppi',
      moduleCode: 'IT2070',
      title: 'DSA Trees & Graphs Kuppi',
      topicSummary: 'Revision session.',
      mode: 'On-Campus',
      locationOrLink: 'Hall A502',
      scheduleLabel: 'Thu 5 PM',
      priceLkr: 0,
      platformFeeLkr: 0,
      sellerPayoutLkr: 0,
      maxSeats: 40,
      attendeeIds: ['stu-2', 'stu-3'],
      status: 'open',
      createdAtMs: 100,
    },
    {
      id: 'k-study',
      hostId: 'stu-4',
      hostName: 'Oshadi Silva',
      hostSliitId: 'IT22440119',
      hostCampus: 'Malabe',
      sessionType: 'study_group',
      moduleCode: 'IT2040',
      title: 'DBMS Normalization Study',
      topicSummary: 'Group revision.',
      mode: 'On-Campus',
      locationOrLink: 'Library',
      scheduleLabel: 'Fri 2 PM',
      priceLkr: 0,
      platformFeeLkr: 0,
      sellerPayoutLkr: 0,
      maxSeats: 12,
      attendeeIds: ['stu-2'],
      status: 'open',
      createdAtMs: 110,
    },
  ];

  const sellerStats = computeStudentProfileStats(
    { uid: 'stu-1', displayName: 'Dilshan Rodrigo', sliitStudentId: 'IT20784120', campus: 'Malabe', faculty: 'Computing' },
    gigs,
    orders,
    kuppiSessions
  );
  assert.equal(sellerStats.completedSellerOrders, 1);
  assert.equal(sellerStats.kuppiHostedCount, 1);
  assert.equal(sellerStats.freeServicesCount, 1);
  assert.equal(sellerStats.earnedBadges.some((b) => b.id === 'top_rated_seller'), true);
  assert.equal(sellerStats.earnedBadges.some((b) => b.id === 'kuppi_master'), true);
  assert.equal(sellerStats.earnedBadges.some((b) => b.id === 'verified_closer'), true);
  assert.equal(sellerStats.earnedBadges.some((b) => b.id === 'free_mentor'), true);

  const attendeeStats = computeStudentProfileStats(
    { uid: 'stu-2', displayName: 'Dineth Gunasekara', campus: 'Malabe' },
    gigs,
    orders,
    kuppiSessions
  );
  assert.equal(attendeeStats.completedBuyerOrders, 1);
  assert.equal(attendeeStats.kuppiAttendedCount, 2);
  assert.equal(attendeeStats.earnedBadges.some((b) => b.id === 'kuppi_master'), true);
  assert.equal(attendeeStats.earnedBadges.some((b) => b.id === 'study_streak'), true);
  assert.equal(attendeeStats.earnedBadges.some((b) => b.id === 'verified_closer'), true);
  assert.equal(attendeeStats.earnedBadges.some((b) => b.id === 'top_rated_seller'), false);

  const freshStats = computeStudentProfileStats(
    { uid: 'stu-new', displayName: 'Fresh Student', sliitStudentId: 'IT23001122', campus: 'Kandy' },
    gigs,
    orders,
    kuppiSessions
  );
  assert.equal(freshStats.earnedBadges.length, 1);
  assert.equal(freshStats.earnedBadges[0].id, 'campus_verified');
});

