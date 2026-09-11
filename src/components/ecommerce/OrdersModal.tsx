import React, { useState } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, Order } from "@/lib/ecommerceStore";

export const OrdersModal: React.FC = () => {
  const { orders, isOrdersOpen, closeOrders, addToCart, openCart } = useECommerce();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isOrdersOpen) return null;

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.product, item.quantity);
    });
    closeOrders();
    openCart();
  };

  const activeOrderToView = selectedOrder || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm transition-opacity"
        onClick={closeOrders}
      />

      {/* Modal Card */}
      <div className="relative z-10 my-8 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-graphite">Order History &amp; Dispatch Tracking</h2>
              <p className="text-xs text-muted-foreground">
                {orders.length} simulated procurement {orders.length === 1 ? "order" : "orders"} on record
              </p>
            </div>
          </div>

          <button
            onClick={closeOrders}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-steel-light hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[calc(85vh-120px)] overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-steel-light text-muted-foreground mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <h3 className="font-display text-base font-bold text-graphite">No Orders Placed Yet</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                When you simulate or place a purchase, your serialized invoices and tracking timelines will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
              {/* Left: Orders List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  All Orders ({orders.length})
                </h4>
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {orders.map((ord) => {
                    const isSelected = activeOrderToView?.id === ord.id;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-blue bg-blue-50/40 shadow-xs ring-1 ring-brand-blue"
                            : "border-border hover:bg-steel-light/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-blue">
                            #{ord.orderNumber}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                              ord.orderStatus === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.orderStatus === "Dispatched"
                                ? "bg-blue-100 text-brand-blue"
                                : ord.orderStatus === "Confirmed"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-steel-light text-muted-foreground"
                            }`}
                          >
                            ● {ord.orderStatus}
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between text-xs">
                          <span className="text-muted-foreground">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-display font-bold text-graphite">
                            {formatINR(ord.total)}
                          </span>
                        </div>

                        <p className="text-[0.68rem] text-muted-foreground mt-1 line-clamp-1">
                          {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(", ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Selected Order Deep Dive */}
              {activeOrderToView && (
                <div className="rounded-2xl border border-border p-5 space-y-5 bg-steel-light/10">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h4 className="font-display text-sm font-bold text-graphite">
                        Order #{activeOrderToView.orderNumber}
                      </h4>
                      <p className="text-[0.68rem] text-muted-foreground">
                        Placed on {new Date(activeOrderToView.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReorder(activeOrderToView)}
                      className="rounded-lg bg-brand-blue px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors cursor-pointer"
                    >
                      Re-Order Items ↺
                    </button>
                  </div>

                  {/* Tracking status bar */}
                  <div className="rounded-xl border border-border bg-white p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-graphite mb-2">
                      <span>Status: {activeOrderToView.orderStatus}</span>
                      <span className="font-mono text-[0.68rem] text-brand-blue">
                        Trk: {activeOrderToView.trackingNumber}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width:
                            activeOrderToView.orderStatus === "Delivered"
                              ? "100%"
                              : activeOrderToView.orderStatus === "Dispatched"
                              ? "75%"
                              : activeOrderToView.orderStatus === "Processing"
                              ? "50%"
                              : "25%",
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
                      <span>Carrier: {activeOrderToView.shippingMethod.name}</span>
                      <span>Est Delivery: {activeOrderToView.estimatedDelivery}</span>
                    </div>
                  </div>

                  {/* Consignee */}
                  <div className="rounded-xl border border-border bg-white p-3.5 text-xs space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Consignee &amp; Dispatch Location
                    </span>
                    <p className="font-bold text-graphite">{activeOrderToView.customer.fullName}</p>
                    {activeOrderToView.customer.companyName && (
                      <p className="text-brand-blue font-semibold">
                        {activeOrderToView.customer.companyName}
                      </p>
                    )}
                    {activeOrderToView.customer.gstin && (
                      <p className="font-mono text-[0.68rem] text-muted-foreground">
                        GST: {activeOrderToView.customer.gstin}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {activeOrderToView.customer.address}, {activeOrderToView.customer.city},{" "}
                      {activeOrderToView.customer.state} - {activeOrderToView.customer.pincode}
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-graphite">
                      Items Ordered
                    </p>
                    <div className="rounded-xl border border-border bg-white divide-y divide-border/60">
                      {activeOrderToView.items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-graphite">{item.product.name}</p>
                            <p className="font-mono text-[0.68rem] text-muted-foreground">
                              SKU: {item.product.sku} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-brand-blue">
                            {formatINR(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="rounded-xl border border-border bg-white p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatINR(activeOrderToView.subtotal)}</span>
                    </div>
                    {activeOrderToView.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount ({activeOrderToView.couponCode})</span>
                        <span>-{formatINR(activeOrderToView.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (18%)</span>
                      <span>{formatINR(activeOrderToView.tax)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>
                        {activeOrderToView.shippingCost === 0
                          ? "FREE"
                          : formatINR(activeOrderToView.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1.5 font-bold text-graphite">
                      <span>Total Paid</span>
                      <span className="text-brand-blue font-extrabold">
                        {formatINR(activeOrderToView.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
