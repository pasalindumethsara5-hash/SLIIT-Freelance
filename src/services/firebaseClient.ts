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
