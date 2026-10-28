import React, { useState, useEffect, useRef } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, CustomerInfo } from "@/lib/ecommerceStore";
import { openRazorpayCheckout } from "@/lib/razorpayService";
import { ProductImage } from "@/components/common/ProductImage";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface CheckoutPageProps {
  onNavigateHome: (target: string, isPage?: boolean) => void;
}

interface CheckoutQuantityInputProps {
  quantity: number;
  minOrderQty?: number;
  maxQty?: number;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}

const CheckoutQuantityInput: React.FC<CheckoutQuantityInputProps> = ({
  quantity,
  minOrderQty = 1,
  maxQty = 99999,
  onUpdate,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(quantity));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(quantity));
    }
  }, [quantity, isEditing]);

  const commitValue = (text: string) => {
    const parsed = parseInt(text, 10);
    if (isNaN(parsed) || parsed < minOrderQty) {
      setInputValue(String(minOrderQty));
      onUpdate(minOrderQty);
    } else if (parsed > maxQty) {
      setInputValue(String(maxQty));
      onUpdate(maxQty);
    } else {
      setInputValue(String(parsed));
      onUpdate(parsed);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(clean);

    if (clean !== "") {
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed) && parsed >= minOrderQty) {
        onUpdate(Math.min(parsed, maxQty));
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    commitValue(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleDecrease = () => {
    const current = parseInt(inputValue, 10) || quantity;
    if (current > minOrderQty) {
      const next = current - 1;
      setInputValue(String(next));
      onUpdate(next);
    } else {
      onRemove();
    }
  };

  const handleIncrease = () => {
    const current = parseInt(inputValue, 10) || quantity;
    const next = Math.min(maxQty, current + 1);
    setInputValue(String(next));
    onUpdate(next);
  };

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-[#004f9e]/50 focus-within:border-[#004f9e] focus-within:ring-2 focus-within:ring-[#004f9e]/20 transition-all">
      <button
        type="button"
        onClick={handleDecrease}
        className="flex h-6.5 w-6.5 items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-l-lg cursor-pointer select-none"
        title={quantity <= minOrderQty ? "Remove item" : "Decrease quantity by 1"}
        aria-label="Decrease quantity"
      >
        -
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onFocus={(e) => {
          setIsEditing(true);
          e.target.select();
        }}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-11 text-center font-mono font-bold text-xs text-graphite bg-transparent focus:outline-hidden py-0.5 px-0.5 selection:bg-[#004f9e] selection:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Item quantity"
        title="Type quantity manually (e.g. 5, 25, 100)"
      />

      <button
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= maxQty}
        className="flex h-6.5 w-6.5 items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-r-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
        title="Increase quantity by 1"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome }) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartTotal,
    selectedShipping,
    placeOrder,
    recordIncompleteOrder,
    markLeadRecovered,
    updateCartQty,
    removeFromCart,
    removeCoupon,
  } = useECommerce();

  const [step, setStep] = useState<1 | 2>(1);
  const activeLeadOrderNumberRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<"razorpay" | "cod">("razorpay");
  const [gatewayStage, setGatewayStage] = useState<string | null>(null);

  // Clear any existing legacy coupons on mount
  useEffect(() => {
    removeCoupon();
  }, [removeCoupon]);

  // Customer Profile state with localStorage caching
  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    try {
      const cached = localStorage.getItem("qualitech_customer_profile_v1");
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      gstin: "",
      address: "",
      city: "",
      state: "Telangana",
      pincode: "",
      country: "India",
      orderNotes: "",
    };
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cache customer details for returning buyer ease
    try {
      localStorage.setItem("qualitech_customer_profile_v1", JSON.stringify(customer));
    } catch (_) {}

    // Immediately record incomplete order / customer lead so data is never lost if customer drops off at payment
    try {
      const lead = recordIncompleteOrder(
        {
          items: cart,
          customer: {
            ...customer,
            orderNotes: customer.orderNotes
              ? `${customer.orderNotes} [Customer reached payment step 2]`
              : "[Customer reached payment step 2]",
          },
          shippingMethod: selectedShipping,
          paymentMethod: paymentChoice === "razorpay" ? "UPI / Razorpay (Instant)" : "Cash on Delivery",
          paymentStatus: "Incomplete",
          orderStatus: "Payment Incomplete",
          subtotal: cartSubtotal,
          discount: 0,
          tax: cartTax,
          shippingCost: cartShipping,
          total: cartTotal,
          followUpStatus: "New Lead",
        },
        activeLeadOrderNumberRef.current || undefined
      );
      if (lead?.orderNumber) {
        activeLeadOrderNumberRef.current = lead.orderNumber;
      }
    } catch (err) {
      console.warn("Could not pre-save incomplete customer lead:", err);
    }
  };

  const handlePlaceOrderWithCOD = () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      localStorage.setItem("qualitech_customer_profile_v1", JSON.stringify(customer));
    } catch (_) {}

    setTimeout(() => {
      placeOrder({
        items: cart,
        customer: {
          ...customer,
          orderNotes: `${customer.orderNotes || ""} [Cash on Delivery - Verify Phone Before Dispatch]`,
        },
        shippingMethod: selectedShipping,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Cash on Delivery",
        orderStatus: "Confirmed",
        subtotal: cartSubtotal,
        discount: 0,
        tax: cartTax,
        shippingCost: cartShipping,
        total: cartTotal,
      });

      setIsSubmitting(false);
      setStep(1);

      // Mark the captured lead as recovered
      if (activeLeadOrderNumberRef.current) {
        markLeadRecovered(activeLeadOrderNumberRef.current);
        activeLeadOrderNumberRef.current = null;
      }
    }, 350);
  };

  const handlePlaceOrderWithRazorpay = () => {
    setIsSubmitting(true);
    setGatewayStage("Connecting to Razorpay...");
    setErrorMessage(null);

    try {
      localStorage.setItem("qualitech_customer_profile_v1", JSON.stringify(customer));
    } catch (_) {}

    const generatedOrderNum = `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    openRazorpayCheckout({
      amountInRupees: cartTotal,
      orderNumber: generatedOrderNum,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      companyName: customer.companyName,
      gstin: customer.gstin,
      onProgress: (stage) => {
        if (stage === "creating_order") setGatewayStage("Connecting to Razorpay...");
        else if (stage === "ready") setGatewayStage("Awaiting Payment Completion...");
        else if (stage === "verifying") setGatewayStage("Verifying Bank Authorization...");
      },
      onSuccess: ({ paymentId, orderId, verified, simulated }) => {
        setGatewayStage(null);

        placeOrder({
          items: cart,
          customer: {
            ...customer,
            orderNotes: `${customer.orderNotes || ""} [Razorpay Txn: ${paymentId}${orderId ? ` | Order ID: ${orderId}` : ""}${verified ? " | Verified ✓" : ""}${simulated ? " (Test Mode)" : ""}]`,
          },
          shippingMethod: selectedShipping,
          paymentMethod: "UPI / Razorpay (Instant)",
          paymentStatus: "Paid",
          orderStatus: "Confirmed",
          subtotal: cartSubtotal,
          discount: 0,
          tax: cartTax,
          shippingCost: cartShipping,
          total: cartTotal,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId || undefined,
        });

        setIsSubmitting(false);
        setStep(1);

        // Mark the captured lead as recovered
        if (activeLeadOrderNumberRef.current) {
          markLeadRecovered(activeLeadOrderNumberRef.current);
          activeLeadOrderNumberRef.current = null;
        }
      },
      onFailure: (err) => {
        setIsSubmitting(false);
        setGatewayStage(null);
        setErrorMessage(
          err?.description ||
            err?.message ||
            "Razorpay payment was not completed. Please retry or choose Cash on Delivery."
        );

        recordIncompleteOrder(
          {
            items: cart,
            customer: {
              ...customer,
              orderNotes: `${customer.orderNotes || ""} [Payment Failed: ${err?.description || err?.message || "Cancelled by user"}]`,
            },
            shippingMethod: selectedShipping,
            paymentMethod: "UPI / Razorpay (Instant)",
            paymentStatus: "Failed",
            orderStatus: "Payment Failed",
            subtotal: cartSubtotal,
            discount: 0,
            tax: cartTax,
            shippingCost: cartShipping,
            total: cartTotal,
            followUpStatus: "New Lead",
          },
          activeLeadOrderNumberRef.current || undefined
        );
      },
      onDismiss: () => {
        setIsSubmitting(false);
        setGatewayStage(null);

        recordIncompleteOrder(
          {
            items: cart,
            customer: {
              ...customer,
              orderNotes: `${customer.orderNotes || ""} [Checkout Dismissed by Customer at Gateway]`,
            },
            shippingMethod: selectedShipping,
            paymentMethod: "UPI / Razorpay (Instant)",
            paymentStatus: "Incomplete",
            orderStatus: "Payment Incomplete",
            subtotal: cartSubtotal,
            discount: 0,
            tax: cartTax,
            shippingCost: cartShipping,
            total: cartTotal,
            followUpStatus: "New Lead",
          },
          activeLeadOrderNumberRef.current || undefined
        );
      },
    });
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-foreground flex flex-col justify-between">
        <Header onNavigate={onNavigateHome} currentPage="checkout" />

        {/* Empty Body */}
        <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-16">
          <div className="max-w-md w-full rounded-3xl bg-white border border-border p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#004f9e] mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">Your Cart is Currently Empty</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Looks like you haven't added any industrial connectors or custom cable harnesses yet. Explore our authorized catalogue to continue.
            </p>
            <button
              onClick={() => onNavigateHome("#products")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-all shadow-md cursor-pointer w-full"
            >
              <span>Explore Industrial Catalogue</span>
              <span>→</span>
            </button>
          </div>
        </main>

        <Footer onNavigate={onNavigateHome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground flex flex-col justify-between">
      {/* Site Header */}
      <Header onNavigate={onNavigateHome} currentPage="checkout" />

      {/* Main Checkout Grid */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        {/* Stepper Tabs Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white px-5 py-3.5 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                step === 1
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full text-[0.65rem] bg-black/10">
                {step > 1 ? "✓" : "1"}
              </span>
              <span>1. Delivery Details</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              type="button"
              onClick={() => {
                if (customer.fullName && customer.email && customer.phone && customer.address) {
                  setStep(2);
                }
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                step === 2
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full text-[0.65rem] bg-black/10">
                2
              </span>
              <span>2. Review &amp; Payment</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 text-base font-bold">
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Checkout Forms (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Delivery & Consignee Details */}
            {step === 1 && (
              <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-xs">
                <div className="border-b border-border pb-5 mb-6">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-graphite tracking-tight">
                    Delivery &amp; Consignee Information
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Provide your dispatch coordinates and optional GSTIN for official B2B tax invoice.
                  </p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">
                        Official Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="e.g. ramesh@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">
                        Phone / WhatsApp Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">
                        Company / Organization (Optional)
                      </label>
                      <input
                        type="text"
                        value={customer.companyName || ""}
                        onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                        placeholder="e.g. Bharat Electronics Ltd"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* GSTIN Box */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#004f9e] flex items-center gap-1.5">
                        <span>GSTIN for 18% Input Tax Credit (ITC)</span>
                      </label>
                      <span className="text-[0.65rem] text-muted-foreground font-semibold">Optional</span>
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      value={customer.gstin || ""}
                      onChange={(e) => setCustomer({ ...customer, gstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 36AABCB1234F1Z9"
                      className="w-full rounded-xl border border-blue-200/80 bg-white px-3.5 py-2 font-mono text-xs uppercase text-graphite focus:border-[#004f9e] focus:outline-hidden"
                    />
                    <p className="text-[0.65rem] text-slate-500 mt-1">
                      GST tax invoice with HSN codes will be generated and dispatched with physical shipment.
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-graphite mb-1.5">
                      Shipping Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Plot No., Industrial Area, Street / Building Name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        placeholder="Hyderabad"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">State *</label>
                      <input
                        type="text"
                        required
                        value={customer.state}
                        onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                        placeholder="Telangana"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-graphite mb-1.5">PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={customer.pincode}
                        onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                        placeholder="500051"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-graphite mb-1.5">
                      Dispatch / Packaging Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={customer.orderNotes || ""}
                      onChange={(e) => setCustomer({ ...customer, orderNotes: e.target.value })}
                      placeholder="e.g. Include Certificate of Conformity (CoC)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-graphite focus:border-[#004f9e] focus:bg-white focus:outline-hidden transition-all font-medium"
                    />
                  </div>

                  {/* Submit to Step 2 */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onNavigateHome("#products")}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      ← Back to Catalogue
                    </button>

                    <button
                      type="submit"
                      className="rounded-xl bg-[#004f9e] px-7 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: Review & Razorpay Payment */}
            {step === 2 && (
              <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-border pb-5">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-graphite tracking-tight">
                    Review Order &amp; Select Payment
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Choose between Instant Razorpay Gateway (UPI, Cards, NetBanking) or Cash on Delivery.
                  </p>
                </div>

                {/* Delivery Preview Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Consignee &amp; Dispatch Destination
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[0.7rem] font-bold text-[#004f9e] hover:underline cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {customer.fullName} {customer.companyName ? `• ${customer.companyName}` : ""}
                  </p>
                  {customer.gstin && (
                    <p className="font-mono text-[0.7rem] text-[#004f9e] font-semibold">
                      GSTIN: {customer.gstin}
                    </p>
                  )}
                  <p className="text-slate-600">
                    {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
                  </p>
                  <p className="text-slate-500 font-mono text-[0.7rem]">
                    Phone: {customer.phone} • Email: {customer.email}
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-graphite uppercase tracking-wider">
                      Select Payment Method *
                    </label>
                    <span className="text-[0.68rem] text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      100% Protected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Razorpay Option */}
                    <label
                      onClick={() => setPaymentChoice("razorpay")}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-4 transition-all cursor-pointer select-none ${
                        paymentChoice === "razorpay"
                          ? "border-[#004f9e] bg-blue-50/50 shadow-sm shadow-[#004f9e]/15 ring-2 ring-[#004f9e]/20"
                          : "border-border bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${
                              paymentChoice === "razorpay"
                                ? "bg-[#004f9e] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-graphite">Razorpay Online</p>
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.2 font-mono text-[0.6rem] font-bold text-[#004f9e]">
                                Live Gateway
                              </span>
                            </div>
                            <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                              UPI, Cards, NetBanking, EMI
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="page_payment_choice"
                          checked={paymentChoice === "razorpay"}
                          onChange={() => setPaymentChoice("razorpay")}
                          className="h-4 w-4 text-[#004f9e] focus:ring-[#004f9e]"
                        />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <span className="rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[0.62rem] font-bold text-emerald-700 uppercase">
                            UPI (GPay / PhonePe / Paytm)
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.62rem] font-medium text-slate-600">
                            Cards / NetBanking
                          </span>
                        </div>
                        <span className="text-[0.62rem] text-emerald-600 font-bold">Instant Verified</span>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label
                      onClick={() => setPaymentChoice("cod")}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-4 transition-all cursor-pointer select-none ${
                        paymentChoice === "cod"
                          ? "border-[#004f9e] bg-blue-50/50 shadow-sm shadow-[#004f9e]/15 ring-2 ring-[#004f9e]/20"
                          : "border-border bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              paymentChoice === "cod" ? "bg-[#004f9e] text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-graphite">Cash on Delivery</p>
                            <p className="text-[0.68rem] text-muted-foreground mt-0.5">Pay upon delivery at works</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="page_payment_choice"
                          checked={paymentChoice === "cod"}
                          onChange={() => setPaymentChoice("cod")}
                          className="h-4 w-4 text-[#004f9e] focus:ring-[#004f9e]"
                        />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[0.62rem] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md uppercase">
                          Cash / UPI on Arrival
                        </span>
                        <span className="text-[0.62rem] text-slate-500 font-medium">No Advance</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ← Back to Details
                  </button>

                  {paymentChoice === "cod" ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrderWithCOD}
                      className="flex-1 max-w-md flex items-center justify-center gap-2 rounded-xl bg-[#004f9e] py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-slate-900 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Confirming Cash on Delivery Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Order (Cash on Delivery)</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrderWithRazorpay}
                      className="flex-1 max-w-md flex items-center justify-center gap-2 rounded-xl bg-[#004f9e] hover:bg-slate-900 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{gatewayStage || "Opening Razorpay Secure Gateway..."}</span>
                        </>
                      ) : (
                        <>
                          <span>Pay via Razorpay • {formatINR(cartTotal)}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 text-[0.68rem] text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    256-Bit SSL Encrypted
                  </span>
                  <span>•</span>
                  <span>RBI Authorized Razorpay Gateway</span>
                  <span>•</span>
                  <span>Instant GST Invoice</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="font-display text-base font-bold text-graphite uppercase tracking-wider">
                  Order Summary ({cartCount} {cartCount === 1 ? "Item" : "Items"})
                </h2>
                <span className="text-[0.65rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Quality Verified
                </span>
              </div>

              {/* Items List with Interactive Quantity Adjustment */}
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <ProductImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                          showText={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-graphite line-clamp-1">{item.product.name}</p>
                        <p className="font-mono text-[0.68rem] text-muted-foreground truncate">
                          SKU: {item.product.sku}
                        </p>
                        {/* Interactive Quantity Controls */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <CheckoutQuantityInput
                            quantity={item.quantity}
                            minOrderQty={item.product.minOrderQty || 1}
                            maxQty={item.product.stockCount && item.product.stockCount > 0 ? Math.max(item.product.stockCount, 9999) : 99999}
                            onUpdate={(qty) => updateCartQty(item.product.id || "", qty)}
                            onRemove={() => removeFromCart(item.product.id || "")}
                          />

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id || "")}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove item from order"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-graphite block">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground font-mono block">
                        {formatINR(item.unitPrice)}/ea
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal (Excl. Tax)</span>
                  <span className="font-semibold text-graphite font-mono">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST 18% (Tax Invoice Provided)</span>
                  <span className="font-semibold text-graphite font-mono">{formatINR(cartTax)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping &amp; Logistics Freight</span>
                  <span className="font-semibold text-graphite font-mono">
                    {cartShipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE (24-48h Dispatch)</span>
                    ) : (
                      formatINR(cartShipping)
                    )}
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-t border-border pt-3 text-base">
                  <div>
                    <span className="font-display font-bold text-graphite">Total Payable</span>
                    <p className="text-[0.62rem] text-muted-foreground">Includes all taxes and delivery charges</p>
                  </div>
                  <span className="font-display text-2xl font-black text-[#004f9e] font-mono">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Features Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004f9e]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Direct Authorized Sourcing</p>
                  <p className="text-[0.68rem] text-muted-foreground">100% Genuine Amphenol &amp; Zolex Factory Stock</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Razorpay Live Protection</p>
                  <p className="text-[0.68rem] text-muted-foreground">Encrypted Settlement with Instant Bank Confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer onNavigate={onNavigateHome} />
    </div>
  );
};
