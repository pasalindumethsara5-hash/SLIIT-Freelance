import { onAuthStateChanged, type User } from 'firebase/auth';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { CampusAiView } from './components/CampusAiView';
import { CampusBotWidget } from './components/CampusBotWidget';
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
  const [isBotOpen, setIsBotOpen] = useState(false);

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
    if (tab === 'ai') {
      setIsBotOpen(true);
    }
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

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    deliveryNote?: string,
    reviewData?: { rating: number; feedback: string }
  ) => {
    const isCloud = cloudOrders.some((o) => o.id === orderId);
    if (firebaseUser && isCloud) {
      await updateOrderStatusDoc(orderId, nextStatus, deliveryNote, reviewData);
    } else {
      setSandboxOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                deliveryNote: deliveryNote !== undefined ? deliveryNote : o.deliveryNote,
                rating: reviewData ? reviewData.rating : o.rating,
                feedback: reviewData ? reviewData.feedback : o.feedback,
                reviewedAtMs: reviewData ? Date.now() : o.reviewedAtMs,
                updatedAtMs: Date.now(),
              }
            : o
        )
      );

      // If review is submitted, update the corresponding gig rating & reviewCount
      if (reviewData) {
        const targetOrder = sandboxOrders.find((o) => o.id === orderId);
        if (targetOrder?.gigId) {
          setSandboxGigs((prevGigs) =>
            prevGigs.map((g) => {
              if (g.id === targetOrder.gigId) {
                const currentCount = g.reviewCount || 0;
                const newCount = currentCount + 1;
                const newRating = Number(((g.rating * currentCount + reviewData.rating) / newCount).toFixed(1));
                return { ...g, rating: newRating, reviewCount: newCount };
              }
              return g;
            })
          );
        }
      }
    }
    showToast(
      reviewData
        ? `Order ${orderId} completed with ★ ${reviewData.rating} review!`
        : `Order ${orderId} updated to ${nextStatus.replace('_', ' ')}.`
    );
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
                    onNavigateAi={() => {
                      setIsBotOpen(true);
                      selectTab('ai');
                    }}
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

          <footer className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 pb-8 pt-4 space-y-3">
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-slate-500">
              <p>
                Crafted with care by <span className="font-semibold text-[#0B1F3A]">The team Vanguard</span>
              </p>
              <p className="font-medium">© 2026 The team Vanguard. All Rights Reserved.</p>
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

          <CampusBotWidget
            currentUser={currentUser}
            gigsCount={allGigs.length}
            freeGigsCount={freeGigsCount}
            kuppiCount={allKuppiSessions.length}
            isOpen={isBotOpen}
            onToggle={() => setIsBotOpen((prev) => !prev)}
            onClose={() => setIsBotOpen(false)}
          />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  );
}
