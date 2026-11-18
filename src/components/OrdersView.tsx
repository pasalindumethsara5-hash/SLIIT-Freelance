import { CheckCircle2, Clock, ExternalLink, FileText, MessageSquarePlus, PackageCheck, Sparkles, Star, Trash2, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { Order, OrderStatus, UserProfile } from '../types/marketplace';
import { formatLkr, sanitizeTextInput, type StudentIdentitySeed } from '../utils/campusRules';

interface OrdersViewProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onUpdateStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    deliveryNote?: string,
    reviewData?: { rating: number; feedback: string }
  ) => Promise<void>;
  onOpenMarketplace: () => void;
  onOpenProfile: (identity: StudentIdentitySeed) => void;
}

const QUICK_TAGS = [
  '🚀 Delivered on time',
  '💻 Clean & well-documented code',
  '✨ Exceeded expectations',
  '💬 Great campus communication',
  '💯 Highly recommended peer seller',
];

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

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Bank Receipt Viewer State
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

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

  const handleOpenReviewModal = (order: Order) => {
    setReviewOrder(order);
    setRating(order.rating ?? 5);
    setFeedback(order.feedback ?? '');
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      const cleanFeedback = sanitizeTextInput(feedback, 600) || 'Excellent work and smooth campus delivery!';
      await onUpdateStatus(reviewOrder.id, 'completed', undefined, {
        rating,
        feedback: cleanFeedback,
      });
      setReviewOrder(null);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setFeedback((prev) => (prev ? `${prev} · ${tag}` : tag));
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-700 tracking-wide">Escrowed Campus Orders &amp; Reviews</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
            Order Lifecycle, Ratings &amp; Payouts
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Track deliverables, leave verified ratings &amp; feedback, and release the 75% seller payout / 25% platform split.
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
            const canReview = order.status === 'completed' && (isBuyer || currentUser?.isFounderAdmin);

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

                  {/* Bank Transfer Receipt */}
                  {order.receiptUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500">Bank Slip:</span>
                      <button
                        type="button"
                        onClick={() => setViewingReceiptUrl(order.receiptUrl!)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Bank Slip
                      </button>
                    </div>
                  )}

                  {/* Verified Review Display */}
                  {order.rating && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col gap-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= (order.rating || 5) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-mono-num text-xs font-bold text-amber-900">
                            ★ {(order.rating || 5).toFixed(1)} / 5.0
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          Verified Campus Review
                        </span>
                      </div>
                      {order.feedback && (
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          "{order.feedback}"
                        </p>
                      )}
                      <div className="text-[11px] text-slate-500">
                        Feedback by <span className="font-semibold text-slate-800">{order.buyerName}</span> ({order.buyerCampus})
                      </div>
                    </div>
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
                      onClick={() => handleOpenReviewModal(order)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
                    >
                      {isFree ? 'Approve & Leave Feedback' : 'Approve Delivery & Rate Seller'}
                    </button>
                  )}

                  {canReview && (
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(order)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
                      {order.rating ? 'Update Review & Rating' : 'Leave Review & Rating'}
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to cancel and delete order ${order.id}?`)) {
                          void handleAction(order.id, 'cancelled');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel &amp; Delete Order
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Review & Rating Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel bg-white/95 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-white"
            >
              {/* Modal Top */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Campus Peer Review</span>
                  </div>
                  <h3 id="review-modal-title" className="mt-1 font-display text-xl font-bold text-[#0B1F3A]">
                    Rate &amp; Review Order
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 truncate max-w-[280px]">
                    {reviewOrder.gigTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Star Rating Selector */}
              <div className="mt-5 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-medium text-slate-600">Select Star Rating</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${active ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
                <div className="font-mono-num font-bold text-sm text-amber-900">
                  {rating === 5 && '★★★★★ 5.0 — Exceptional Work'}
                  {rating === 4 && '★★★★☆ 4.0 — Very Good'}
                  {rating === 3 && '★★★☆☆ 3.0 — Average Quality'}
                  {rating === 2 && '★★☆☆☆ 2.0 — Needs Revision'}
                  {rating === 1 && '★☆☆☆☆ 1.0 — Poor Experience'}
                </div>
              </div>

              {/* Quick Tag Suggestions */}
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Quick Feedback Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Feedback Textarea */}
              <div className="mt-4">
                <label htmlFor="review-feedback" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Written Review &amp; Experience
                </label>
                <textarea
                  id="review-feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share details about code quality, communication, and speed for this student seller..."
                  className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => void handleSubmitReview()}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#0B1F3A] via-[#1E3A8A] to-blue-700 hover:opacity-95 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review & Release Escrow'}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Bank Receipt Preview Modal */}
        {viewingReceiptUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewingReceiptUrl(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel bg-white/95 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <h3 id="receipt-modal-title" className="font-display text-sm font-bold text-slate-900">
                    Verified Bank Transfer Slip
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReceiptUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                {viewingReceiptUrl.startsWith('data:image/') ? (
                  <img
                    src={viewingReceiptUrl}
                    alt="Uploaded Bank Transfer Slip"
                    className="max-w-full h-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">Bank transfer receipt PDF document</p>
                    <a
                      href={viewingReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Document
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingReceiptUrl(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
