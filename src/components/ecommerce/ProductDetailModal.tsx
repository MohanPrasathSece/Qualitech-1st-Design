import React, { useState, useMemo } from "react";
import { Product } from "@/data/products";
import { useECommerce } from "@/context/ECommerceContext";
import {
  formatINR,
  getProductDefaultPrice,
  getProductTieredPricing,
  getEffectiveUnitPrice,
} from "@/lib/ecommerceStore";

export const ProductDetailModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    openCheckout,
    products,
    openQuickView,
  } = useECommerce();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "industries" | "compliance">("specs");
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Reset quantity on product change
  React.useEffect(() => {
    if (quickViewProduct) {
      setQuantity(quickViewProduct.minOrderQty || 1);
      setActiveTab("specs");
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const basePrice = getProductDefaultPrice(product);
  const tieredPricing = getProductTieredPricing(product);
  const unitPrice = getEffectiveUnitPrice(product, quantity);
  const totalItemPrice = unitPrice * quantity;
  const standardTotal = basePrice * quantity;
  const savings = standardTotal - totalItemPrice;

  // Find related products in same category or brand
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    closeQuickView();
    openCheckout();
  };

  const handleShareProduct = () => {
    const url = window.location.origin + window.location.pathname + "#shop";
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadDatasheet = () => {
    const content = `QUALITECH CONNECTRONICS PRIVATE LIMITED
TECHNICAL DATASHEET SPECIFICATION
==================================================
Product: ${product.name}
SKU: ${product.sku}
Brand: ${product.brand}
Category: ${product.category} ${product.subCategory ? `> ${product.subCategory}` : ""}
Unit Price: ${formatINR(unitPrice)} (Excl. 18% GST)

DESCRIPTION:
${product.description}

KEY FEATURES:
${product.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

TECHNICAL SPECIFICATIONS:
${Object.entries(product.specs)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

TARGET INDUSTRIES:
${product.industries.join(", ")}

QUALITY & CERTIFICATION:
- ISO 9001:2015 Certified Manufacturing
- IPC/WHMA-A-620 Workmanship Standards
- RoHS & REACH Compliant
- 100% Automated Electrical Continuity & Hipot Tested

Qualitech Connectronics Pvt Ltd
Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad - 500051
Email: info@qualitechindia.in | Tel: +91-40-27140004
==================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Qualitech-Datasheet-${product.sku}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/70 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Container */}
      <div className="relative z-10 my-8 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-border">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                product.brand === "Amphenol"
                  ? "bg-blue-100 text-brand-blue"
                  : product.brand === "Zolex"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {product.brand}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-mono font-medium text-muted-foreground">{product.sku}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProduct}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:bg-steel-light hover:text-foreground transition-colors cursor-pointer"
              title="Copy share link"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copiedLink ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={closeQuickView}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-steel-light hover:text-foreground transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-[1.1fr_1.3fr]">
            {/* Left: Product Media & Badges */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-steel-light/10 p-4">
                <img
                  src={product.image || "/logo.png"}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
                {product.featured && (
                  <span className="absolute top-3 left-3 rounded-full bg-brand-yellow px-2.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider text-graphite shadow-xs">
                    ★ Featured
                  </span>
                )}
                <span
                  className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                    product.inStock
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {product.inStock ? "● In Stock" : "○ Out of Stock"}
                </span>
              </div>

              {/* Lead time & inventory info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/80 bg-steel-light/20 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Lead Time
                  </span>
                  <p className="mt-0.5 font-bold text-graphite">{product.leadTime || "Ships in 24-48h"}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-steel-light/20 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Available Stock
                  </span>
                  <p className="mt-0.5 font-bold text-emerald-600">
                    {product.stockCount || 120} {product.unit || "units"} available
                  </p>
                </div>
              </div>

              {/* Download Datasheet Button */}
              <button
                onClick={handleDownloadDatasheet}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-steel-light/40 py-2.5 text-xs font-bold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Technical Datasheet (.TXT / PDF)
              </button>
            </div>

            {/* Right: Product Purchase Controls */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  {product.category} {product.subCategory && `› ${product.subCategory}`}
                </p>
                <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold text-graphite leading-snug">
                  {product.name}
                </h1>

                {/* Quality & Traceability Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 border border-emerald-200/60">
                    ✓ 100% Electrical &amp; Hipot Tested
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-steel-light px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                    ISO 9001:2015 Traceable
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>

                {/* Pricing Box */}
                <div className="mt-4 rounded-xl border border-border/80 bg-steel-light/30 p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Unit Price (Excl. 18% GST)
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-display text-2xl font-extrabold text-brand-blue">
                          {formatINR(unitPrice)}
                        </span>
                        {unitPrice < basePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatINR(basePrice)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">/ {product.unit || "unit"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Subtotal for {quantity} {product.unit || "pcs"}
                      </span>
                      <p className="font-display text-base font-bold text-graphite mt-0.5">
                        {formatINR(totalItemPrice)}
                      </p>
                      {savings > 0 && (
                        <p className="text-[0.68rem] font-bold text-emerald-600">
                          Saving {formatINR(savings)} ({Math.round((savings / standardTotal) * 100)}% off)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tiered Pricing Table */}
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-graphite mb-1.5">
                      Volume B2B Pricing Tiers
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      {tieredPricing.map((tier, idx) => {
                        const isCurrentTier =
                          quantity >= tier.minQty &&
                          (idx === tieredPricing.length - 1 || quantity < tieredPricing[idx + 1].minQty);

                        return (
                          <button
                            key={tier.minQty}
                            type="button"
                            onClick={() => setQuantity(tier.minQty)}
                            className={`rounded-lg p-1.5 border transition-all cursor-pointer ${
                              isCurrentTier
                                ? "border-brand-blue bg-white shadow-2xs text-brand-blue ring-1 ring-brand-blue"
                                : "border-border/70 bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                          >
                            <span className="block text-[0.62rem] font-bold text-muted-foreground">
                              {tier.minQty}+ {product.unit || "pcs"}
                            </span>
                            <span className="block font-bold text-graphite text-[0.72rem] mt-0.5">
                              {formatINR(tier.price)}
                            </span>
                            {tier.discountLabel && (
                              <span className="block text-[0.55rem] font-bold text-emerald-600">
                                {tier.discountLabel}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quantity & CTA Buttons */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-border bg-steel-light/30 shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-10 w-10 items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground hover:bg-steel-light transition-colors rounded-l-xl cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 text-center text-sm font-bold text-graphite bg-transparent focus:outline-hidden"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground hover:bg-steel-light transition-colors rounded-r-xl cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-graphite px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-all cursor-pointer shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>{addedToast ? "Added to Cart! ✓" : "Add to Cart"}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-brand-blue-soft transition-all cursor-pointer"
                  >
                    <span>Instant Checkout / Buy Now</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Specifications & Documentation */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex border-b border-border gap-6">
              {[
                { id: "specs", label: "Technical Specs" },
                { id: "features", label: "Key Features" },
                { id: "industries", label: "Industries" },
                { id: "compliance", label: "Standards & QC" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 font-display text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-4">
              {activeTab === "specs" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-steel-light/15 px-3.5 py-2 text-xs"
                    >
                      <span className="font-medium text-muted-foreground">{k}</span>
                      <span className="font-bold text-graphite">{v}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-steel-light/15 px-3.5 py-2 text-xs">
                    <span className="font-medium text-muted-foreground">Standard Lead Time</span>
                    <span className="font-bold text-graphite">{product.leadTime || "24-48 Hours"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-steel-light/15 px-3.5 py-2 text-xs">
                    <span className="font-medium text-muted-foreground">Country of Origin</span>
                    <span className="font-bold text-graphite">India / Global Authorized</span>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-graphite">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[0.6rem] font-bold text-brand-blue">
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "industries" && (
                <div className="flex flex-wrap gap-2">
                  {product.industries.map((ind) => (
                    <span
                      key={ind}
                      className="rounded-xl border border-border bg-steel-light/30 px-3 py-1.5 text-xs font-semibold text-graphite"
                    >
                      🏭 {ind}
                    </span>
                  ))}
                </div>
              )}

              {activeTab === "compliance" && (
                <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
                  <div className="rounded-xl border border-border p-3.5">
                    <h5 className="font-bold text-graphite">IPC/WHMA-A-620 Standards</h5>
                    <p className="mt-1 leading-relaxed">
                      All cable harness assemblies are built to Class 3 military and high-reliability specifications.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3.5">
                    <h5 className="font-bold text-graphite">ISO 9001:2015 Registered</h5>
                    <p className="mt-1 leading-relaxed">
                      Full traceability, serialized batch inspection reports, and automated hipot testing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h4 className="font-display text-sm font-bold text-graphite mb-3">
                Complementary Components in {product.brand}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => openQuickView(rel)}
                    className="group rounded-xl border border-border p-2.5 transition-all hover:border-brand-blue hover:shadow-xs cursor-pointer bg-white"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-steel-light/20 p-2">
                      <img
                        src={rel.image || "/logo.png"}
                        alt={rel.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="mt-2 font-display text-[0.72rem] font-bold text-graphite line-clamp-1">
                      {rel.name}
                    </p>
                    <p className="text-[0.65rem] text-brand-blue font-bold mt-0.5">
                      {formatINR(getProductDefaultPrice(rel))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
