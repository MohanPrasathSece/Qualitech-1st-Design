import React, { useState, useEffect } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR } from "@/lib/ecommerceStore";

export const FloatingCartWidget: React.FC = () => {
  const { cartCount, cartTotal, openCart } = useECommerce();
  const [isCheckoutOrAdmin, setIsCheckoutOrAdmin] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      if (typeof window === "undefined") return;
      const h = window.location.hash.toLowerCase();
      setIsCheckoutOrAdmin(
        h === "#checkout" ||
        h === "#/checkout" ||
        h === "#order-checkout" ||
        h.startsWith("#admin")
      );
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    window.addEventListener("popstate", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("popstate", checkHash);
    };
  }, []);

  if (cartCount === 0 || isCheckoutOrAdmin) return null;

  return (
    <aside
      aria-label="Floating cart summary"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans"
    >
      <button
        type="button"
        onClick={openCart}
        aria-label={`Open Cart (${cartCount} items totaling ${formatINR(cartTotal)})`}
        className="group flex items-center gap-3 rounded-2xl bg-graphite-deep px-4 sm:px-5 py-3 sm:py-3.5 text-white shadow-2xl hover:bg-brand-blue transition-all duration-200 cursor-pointer ring-2 ring-white/90 hover:ring-white hover:scale-105 active:scale-95"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-yellow text-graphite font-display font-extrabold text-xs shadow-xs">
          {cartCount}
        </div>
        <div className="text-left">
          <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-white/80">
            Procurement Cart
          </span>
          <span className="block font-mono text-xs sm:text-sm font-extrabold text-white">
            {formatINR(cartTotal)}
          </span>
        </div>
        <svg
          className="h-4 w-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </aside>
  );
};
