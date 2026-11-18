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
