import React from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR } from "@/lib/ecommerceStore";

export const OrderSuccessModal: React.FC = () => {
  const { lastPlacedOrder, closeOrderSuccess, openOrders } = useECommerce();

  if (!lastPlacedOrder) return null;

  const order = lastPlacedOrder;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/80 backdrop-blur-md transition-opacity"
        onClick={closeOrderSuccess}
      />

      {/* Modal Container */}
      <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-border">
        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-3">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Order Successfully Confirmed!</h2>
          <p className="mt-1 text-xs text-white/90">
            Official Tax Invoice &amp; Dispatch Authorization Generated
          </p>
          <div className="mt-3 inline-block rounded-full bg-white/15 px-4 py-1 font-mono text-sm font-bold tracking-wider backdrop-blur-sm">
            Order #{order.orderNumber}
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[calc(85vh-200px)] overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Status Pipeline */}
          <div className="rounded-2xl border border-border bg-steel-light/20 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-graphite mb-3">
              <span>Order Tracking Pipeline</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[0.65rem]">
                Estimated Delivery: {order.estimatedDelivery}
              </span>
            </div>

            <div className="relative flex items-center justify-between">
              {/* Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-0" />
              <div className="absolute left-0 w-1/4 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 -z-0" />

              {[
                { label: "Placed", done: true },
                { label: "Verified", done: true },
                { label: "QC Testing", done: false },
                { label: "Dispatched", done: false },
                { label: "Delivered", done: false },
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                      step.done
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                        : "bg-steel-light text-muted-foreground border border-border"
                    }`}
                  >
                    {step.done ? "✓" : idx + 1}
                  </div>
                  <span className="mt-1 text-[0.65rem] font-semibold text-graphite">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tracking No: <strong className="font-mono text-graphite">{order.trackingNumber}</strong></span>
              <span>Carrier: <strong>{order.shippingMethod.name}</strong></span>
            </div>
          </div>

          {/* Consignee & Details Grid */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border p-3.5 space-y-1 bg-white">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                Consignee Details
              </span>
              <p className="font-bold text-graphite">{order.customer.fullName}</p>
              {order.customer.companyName && (
                <p className="text-brand-blue font-semibold">{order.customer.companyName}</p>
              )}
              {order.customer.gstin && (
                <p className="font-mono text-[0.68rem] text-muted-foreground">
                  GSTIN: {order.customer.gstin}
                </p>
              )}
              <p className="text-muted-foreground">
                {order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
            </div>

            <div className="rounded-xl border border-border p-3.5 space-y-1 bg-white">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                Payment &amp; Terms
              </span>
              <p className="font-bold text-graphite">{order.paymentMethod}</p>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold ${
                  order.paymentStatus === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-brand-blue"
                }`}
              >
                ● Status: {order.paymentStatus}
              </span>
              <p className="text-muted-foreground text-[0.7rem] mt-2">
                Order Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-steel-light/40 font-bold uppercase tracking-wider text-[0.65rem] text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Component / Harness</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {order.items.map((item) => (
                  <tr key={item.product.id} className="hover:bg-steel-light/10">
                    <td className="p-3">
                      <p className="font-bold text-graphite">{item.product.name}</p>
                      <p className="font-mono text-[0.68rem] text-muted-foreground">
                        SKU: {item.product.sku}
                      </p>
                    </td>
                    <td className="p-3 text-center font-bold text-graphite">{item.quantity}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-bold text-brand-blue">
                      {formatINR(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="border-t border-border bg-steel-light/30 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Integrated GST (18%)</span>
                <span>{formatINR(order.tax)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Logistics &amp; Insurance</span>
                <span>{order.shippingCost === 0 ? "FREE" : formatINR(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-graphite">
                <span>Total Amount Paid</span>
                <span className="text-brand-blue font-extrabold text-base">
                  {formatINR(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-steel-light/20 p-5">
          <button
            onClick={handlePrintInvoice}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-xs font-bold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Tax Invoice</span>
          </button>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              onClick={() => {
                closeOrderSuccess();
                openOrders();
              }}
              className="flex-1 sm:flex-none rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
            >
              Track All Orders →
            </button>
            <button
              onClick={closeOrderSuccess}
              className="flex-1 sm:flex-none rounded-xl bg-brand-blue px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all cursor-pointer shadow-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
