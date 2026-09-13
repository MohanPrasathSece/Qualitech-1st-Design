import React, { useState, useEffect } from "react";
import { useECommerce } from "@/context/ECommerceContext";

const WHATSAPP_NUMBER = "919849001484"; // +91 98490 01484

const QUICK_PROMPTS = [
  "I would like to get bulk pricing & stock availability for components.",
  "I need a custom cable harness quote for our OEM production line.",
  "Need immediate dispatch timeline for my order requirement.",
  "Assistance with technical specifications & pinout drawings.",
];

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [skuRequirement, setSkuRequirement] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [selectedPrompt, setSelectedPrompt] = useState(QUICK_PROMPTS[0]);
  const [isAdmin, setIsAdmin] = useState(() => {
    const h = window.location.hash;
    return h === "#admin" || h === "#/admin" || h === "#admin-panel";
  });

  const { cart } = useECommerce();

  useEffect(() => {
    const checkAdmin = () => {
      const h = window.location.hash;
      setIsAdmin(h === "#admin" || h === "#/admin" || h === "#admin-panel");
    };
    window.addEventListener("hashchange", checkAdmin);
    return () => window.removeEventListener("hashchange", checkAdmin);
  }, []);

  if (isAdmin) return null;

  const handleStartChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let cartSummary = "";
    if (cart && cart.length > 0) {
      cartSummary = `\n*Current Cart Items:*\n` + cart.map((it) => `- ${it.product.name} (SKU: ${it.product.sku}) x ${it.quantity}`).join("\n");
    }

    const messageLines = [
      `*Hello Qualitech Connectronics Sales Team,*`,
      buyerName.trim() ? `*Name:* ${buyerName.trim()}` : null,
      skuRequirement.trim() ? `*Product / SKU:* ${skuRequirement.trim()}` : null,
      quantity ? `*Required Quantity:* ${quantity} units` : null,
      `*Inquiry:* ${selectedPrompt}`,
      cartSummary || null,
      `\nPlease assist with official pricing and lead times.`,
    ].filter(Boolean);

    const fullMessage = encodeURIComponent(messageLines.join("\n"));
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${fullMessage}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleDirectQuickChat = () => {
    const defaultMsg = encodeURIComponent(
      "Hello Qualitech Connectronics team, I would like to enquire about electronic components and custom cable harness manufacturing."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMsg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] font-sans">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-4 w-84 sm:w-96 rounded-2xl bg-white p-5 shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                {/* Active status pulse */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-graphite">Direct Sales Desk</h4>
                <p className="text-[0.65rem] text-emerald-600 font-semibold flex items-center gap-1">
                  <span>●</span> Online • Typically replies in 10 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-steel-light hover:text-graphite transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Chat Form */}
          <form onSubmit={handleStartChat} className="mt-3.5 space-y-2.5">
            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Your Name / Company (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh - Bharat Electronics"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-steel-light/20 px-3 py-1.5 text-xs text-graphite placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Product / SKU
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amphenol / Custom Harness"
                  value={skuRequirement}
                  onChange={(e) => setSkuRequirement(e.target.value)}
                  className="w-full rounded-xl border border-border bg-steel-light/20 px-3 py-1.5 text-xs text-graphite placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Estimated Qty
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 pcs"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-steel-light/20 px-3 py-1.5 text-xs text-graphite placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Inquiry Objective
              </label>
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-steel-light/20 px-2.5 py-1.5 text-xs text-graphite focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {QUICK_PROMPTS.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDirectQuickChat}
                className="text-[0.68rem] text-center text-muted-foreground hover:text-emerald-700 transition-colors"
              >
                Or open instant chat without details &rarr;
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with Qualitech on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-xs group-hover:bg-emerald-400/50 transition-all"></span>

        <svg className="relative h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        {/* Small floating badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-yellow text-[0.6rem] font-bold text-graphite shadow-sm">
            1
          </span>
        )}
      </button>
    </div>
  );
};
