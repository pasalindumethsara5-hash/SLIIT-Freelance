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
