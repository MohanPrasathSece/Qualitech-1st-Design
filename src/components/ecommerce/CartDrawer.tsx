import React, { useState } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR } from "@/lib/ecommerceStore";
import { downloadQuotationFromCart } from "@/lib/pdfQuotationService";

interface CartDrawerProps {
  onNavigateToShop?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToShop }) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartTotal,
    freeShippingThreshold,
    freeShippingRemaining,
    isCartOpen,
    closeCart,
    openCheckout,
    updateCartQty,
    removeFromCart,
    clearCart,
  } = useECommerce();

  const [copiedQuote, setCopiedQuote] = useState(false);

  if (!isCartOpen) return null;

  const handleGenerateQuoteSummary = () => {
    const text = [
      `=== QUALITECH CONNECTRONICS - FORMAL RFQ SUMMARY ===`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Items:`,
      ...cart.map(
        (item, idx) =>
          `${idx + 1}. [${item.product.sku}] ${item.product.name} x ${item.quantity} ${item.product.unit || "pcs"} @ ${formatINR(item.unitPrice)} = ${formatINR(item.unitPrice * item.quantity)}`
      ),
      `Subtotal: ${formatINR(cartSubtotal)}`,
      `Estimated GST (18%): ${formatINR(cartTax)}`,
      `Estimated Total: ${formatINR(cartTotal)}`,
      `====================================================`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard?.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  const progressPercent = Math.min(100, Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-background shadow-2xl transition-transform animate-in slide-in-from-right duration-300 sm:border-l sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4.5 bg-steel-light/30">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-graphite">Procurement Cart</h2>
              <p className="text-xs text-muted-foreground">
                {cartCount} {cartCount === 1 ? "item" : "items"} ready for dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-steel-light hover:text-foreground transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="border-b border-border bg-steel-light/15 px-6 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-graphite">
              <span>
                {freeShippingRemaining === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Qualified for Free Express Dispatch!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-brand-blue">{formatINR(freeShippingRemaining)}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[0.68rem] text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingRemaining === 0 ? "bg-emerald-500" : "bg-brand-blue"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-steel-light text-muted-foreground mb-4">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-graphite">Your Cart is Empty</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Explore our catalog of Amphenol connectors, Zolex lugs, and custom cable harnesses.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  if (onNavigateToShop) onNavigateToShop();
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-graphite transition-all cursor-pointer"
              >
                Browse Product Catalogue →
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const basePrice = item.product.price || item.unitPrice;
              const hasTierDiscount = item.unitPrice < basePrice;

              return (
                <div
                  key={item.product.id}
                  className="group flex gap-4 rounded-xl border border-border p-3.5 transition-all hover:border-brand-blue/40 hover:bg-steel-light/10"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-white p-1">
                    <img
                      src={item.product.image || "/logo.png"}
                      alt={item.product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                              item.product.brand === "Amphenol"
                                ? "bg-blue-50 text-brand-blue"
                                : item.product.brand === "Zolex"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.product.brand}
                          </span>
                          <h4 className="mt-1 font-display text-xs font-bold text-graphite line-clamp-1 leading-snug">
                            {item.product.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id || item.product.id || item.product.sku)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-mono text-[0.68rem] text-muted-foreground mt-0.5">
                        SKU: {item.product.sku}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-border bg-white shadow-2xs">
                        <button
                          onClick={() => updateCartQty(item.id || item.product.id || item.product.sku, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-steel-light transition-colors rounded-l-lg cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-graphite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id || item.product.id || item.product.sku, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-steel-light transition-colors rounded-r-lg cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1.5">
                          {hasTierDiscount && (
                            <span className="text-[0.68rem] text-muted-foreground line-through">
                              {formatINR(basePrice * item.quantity)}
                            </span>
                          )}
                          <span className="font-display text-sm font-bold text-brand-blue">
                            {formatINR(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                        <p className="text-[0.62rem] text-muted-foreground">
                          {formatINR(item.unitPrice)} / {item.product.unit || "unit"}
                          {hasTierDiscount && (
                            <span className="ml-1 text-emerald-600 font-semibold">(Tier Price)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="border-t border-border bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            {/* Calculations Breakdown */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-semibold text-graphite">{formatINR(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  Estimated GST (18%)
                  <span className="rounded-full bg-steel-light px-1 text-[0.6rem]">Tax Credit</span>
                </span>
                <span className="font-semibold text-graphite">{formatINR(cartTax)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping &amp; Logistics</span>
                <span className="font-semibold text-graphite">
                  {cartShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatINR(cartShipping)
                  )}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-border pt-2 text-sm">
                <div>
                  <span className="font-display font-bold text-graphite">Estimated Total</span>
                  <p className="text-[0.62rem] text-muted-foreground">All taxes &amp; handling included</p>
                </div>
                <span className="font-display text-lg font-extrabold text-brand-blue">
                  {formatINR(cartTotal)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={openCheckout}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-graphite transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>



              <button
                type="button"
                onClick={handleGenerateQuoteSummary}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 font-display text-[0.7rem] font-bold uppercase tracking-wider text-graphite hover:bg-steel-light/50 transition-colors cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>{copiedQuote ? "RFQ Copied to Clipboard!" : "Copy Official RFQ Text"}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[0.65rem] text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                100% IPC Tested
              </span>
              <span>•</span>
              <span>GST Input Credit</span>
              <span>•</span>
              <span>Official OEM Lines</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
