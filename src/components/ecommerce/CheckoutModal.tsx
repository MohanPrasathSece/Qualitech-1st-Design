import React, { useState } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import {
  formatINR,
  CustomerInfo,
} from "@/lib/ecommerceStore";
import { openRazorpayCheckout } from "@/lib/razorpayService";

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartTotal,
    selectedShipping,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    placeOrder,
  } = useECommerce();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<"cod" | "razorpay">("cod");

  // Form State with clean localStorage caching for returning buyers
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

  if (!isCheckoutOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep(2);
  };

  const handlePlaceOrderWithCOD = () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Cache customer details for convenience
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
    }, 350);
  };

  const handlePlaceOrderWithRazorpay = () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Cache customer details for convenience
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
      onSuccess: (paymentId) => {
        placeOrder({
          items: cart,
          customer: {
            ...customer,
            orderNotes: `${customer.orderNotes || ""} [Razorpay Txn: ${paymentId}]`,
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
        });

        setIsSubmitting(false);
        setStep(1);
      },
      onFailure: (err) => {
        setIsSubmitting(false);
        setErrorMessage(err?.description || "Payment failed or cancelled. Please retry.");
      },
      onDismiss: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm transition-opacity"
        onClick={closeCheckout}
      />

      {/* Modal Card */}
      <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white font-bold text-base shadow-xs">
              QT
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-graphite">
                Secure Checkout - Razorpay
              </h2>
              <p className="text-xs text-muted-foreground">Qualitech Connectronics Authorized Payment</p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-steel-light hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="border-b border-border bg-steel-light/10 px-6 py-3">
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 font-bold transition-all ${
                step === 1
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 cursor-pointer"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] bg-white/20">
                {step > 1 ? (
                  <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  "1"
                )}
              </span>
              <span>1. Delivery Details</span>
            </button>

            <button
              type="button"
              className={`flex items-center justify-center gap-2 rounded-xl py-2 font-bold transition-all ${
                step === 2
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-transparent text-muted-foreground"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] bg-black/10">
                2
              </span>
              <span>2. Review &amp; Pay via Razorpay</span>
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="max-h-[calc(85vh-160px)] overflow-y-auto p-6 sm:p-8">
          {/* STEP 1: Customer & Company Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Buyer &amp; Delivery Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter dispatch address and optional GSTIN for tax invoice.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="e.g. ramesh@company.com"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Company / Organization Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.companyName || ""}
                    onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                    placeholder="e.g. Bharat Electronics Ltd"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-blue">
                    GSTIN for 18% Input Tax Credit (ITC)
                  </label>
                  <span className="text-[0.65rem] text-muted-foreground">Optional</span>
                </div>
                <input
                  type="text"
                  maxLength={15}
                  value={customer.gstin || ""}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 36AABCB1234F1Z9"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-xs uppercase text-graphite focus:border-brand-blue focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite mb-1">
                  Shipping Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Plot / Flat, Building, Industrial Area / Street"
                  className="w-full rounded-xl border border-border px-3.5 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="Hyderabad"
                    className="w-full rounded-xl border border-border px-3 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    placeholder="Telangana"
                    className="w-full rounded-xl border border-border px-3 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                    placeholder="500051"
                    className="w-full rounded-xl border border-border px-3 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite mb-1">
                  Order / Packaging Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customer.orderNotes || ""}
                  onChange={(e) => setCustomer({ ...customer, orderNotes: e.target.value })}
                  placeholder="e.g. Include Certificate of Conformity (CoC)"
                  className="w-full rounded-xl border border-border px-3.5 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={openCart}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors"
                >
                  ← Back to Cart
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-blue px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all shadow-sm cursor-pointer"
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Order Review & Instant Razorpay Payment */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Order Summary &amp; Razorpay Payment
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review your items and proceed with instant secure settlement via Razorpay.
                </p>
              </div>

              {/* Items Summary */}
              <div className="rounded-xl border border-border bg-steel-light/15 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-graphite uppercase tracking-wider">
                    Order Items ({cartCount})
                  </p>
                  <span className="text-[0.65rem] text-muted-foreground font-mono">100% Quality Verified</span>
                </div>
                <div className="divide-y divide-border/60 max-h-44 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.68rem] text-muted-foreground">
                          [{item.product.sku}]
                        </span>
                        <span className="font-bold text-graphite">{item.product.name}</span>
                        <span className="text-muted-foreground">x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-brand-blue font-mono">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Coordinates Preview */}
              <div className="rounded-xl border border-border p-3.5 text-xs space-y-1 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Consignee &amp; Delivery Destination
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[0.7rem] font-bold text-brand-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-bold text-graphite">{customer.fullName} {customer.companyName ? `• ${customer.companyName}` : ""}</p>
                {customer.gstin && (
                  <p className="font-mono text-[0.68rem] text-brand-blue font-semibold">GSTIN: {customer.gstin}</p>
                )}
                <p className="text-muted-foreground">
                  {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
                </p>
                <p className="text-muted-foreground">Phone: {customer.phone} • Email: {customer.email}</p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-graphite uppercase tracking-wider">
                    Select Payment Method *
                  </p>
                  <span className="text-[0.65rem] text-muted-foreground">100% Buyer Protection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD Option */}
                  <label
                    onClick={() => setPaymentChoice("cod")}
                    className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all cursor-pointer select-none ${
                      paymentChoice === "cod"
                        ? "border-[#004f9e] bg-blue-50/50 shadow-sm shadow-[#004f9e]/10"
                        : "border-border bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          paymentChoice === "cod" ? "bg-[#004f9e] text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-graphite">Cash on Delivery</p>
                          <p className="text-[0.68rem] text-muted-foreground">Pay on arrival at works</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentChoice === "cod"}
                        onChange={() => setPaymentChoice("cod")}
                        className="h-4 w-4 text-[#004f9e] focus:ring-[#004f9e]"
                      />
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[0.62rem] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md uppercase">
                        Cash / UPI on Delivery
                      </span>
                      <span className="text-[0.62rem] text-slate-500 font-medium">No Advance</span>
                    </div>
                  </label>

                  {/* Razorpay Option */}
                  <label
                    onClick={() => setPaymentChoice("razorpay")}
                    className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all cursor-pointer select-none ${
                      paymentChoice === "razorpay"
                        ? "border-[#004f9e] bg-blue-50/50 shadow-sm shadow-[#004f9e]/10"
                        : "border-border bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          paymentChoice === "razorpay" ? "bg-[#004f9e] text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-graphite">Razorpay Online</p>
                          <p className="text-[0.68rem] text-muted-foreground">UPI, Cards, NetBanking</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentChoice === "razorpay"}
                        onChange={() => setPaymentChoice("razorpay")}
                        className="h-4 w-4 text-[#004f9e] focus:ring-[#004f9e]"
                      />
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[0.62rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md uppercase">
                        Instant Settlement
                      </span>
                      <span className="text-[0.62rem] text-slate-500 font-medium">SSL Secure</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Final Totals */}
              <div className="rounded-xl border border-border bg-steel-light/30 p-4 space-y-2 text-xs">
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
                      <span className="text-emerald-600 font-bold">FREE (Dispatched in 24-48h)</span>
                    ) : (
                      formatINR(cartShipping)
                    )}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2.5 text-base">
                  <span className="font-display font-bold text-graphite">Total Payable</span>
                  <span className="font-display text-xl font-extrabold text-brand-blue font-mono">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                {paymentChoice === "cod" ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePlaceOrderWithCOD}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#004f9e] py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-slate-900 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Confirming Cash on Delivery Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Place Order (Cash on Delivery)</span>
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
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Opening Razorpay Secure Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay with Razorpay</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
