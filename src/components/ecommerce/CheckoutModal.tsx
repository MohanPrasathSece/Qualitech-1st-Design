import React, { useState } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import {
  formatINR,
  CustomerInfo,
  PaymentMethod,
  SHIPPING_OPTIONS,
  ShippingOption,
} from "@/lib/ecommerceStore";

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cartShipping,
    cartTotal,
    selectedShipping,
    setSelectedShipping,
    activeCoupon,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    placeOrder,
  } = useECommerce();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: "Rohan Nair",
    email: "rohan.nair@aerotech-systems.in",
    phone: "+91 98450 67890",
    companyName: "AeroTech Aerospace Solutions Ltd",
    gstin: "36AAACA1234F1Z5",
    address: "Survey No. 45, Hardware & Aerospace Park, Kattedan",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500077",
    country: "India",
    orderNotes: "Please enclose serialized inspection test reports with the shipment.",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI / Razorpay (Instant)");
  const [poNumber, setPoNumber] = useState("PO-AT-2026-089");
  const [upiId, setUpiId] = useState("rohan@okaxis");
  const [utrNumber, setUtrNumber] = useState("");

  if (!isCheckoutOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((s) => ((s + 1) as any));
    }
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      let paymentStatus: "Paid" | "Pending Approval" | "Awaiting Wire" | "Verified" = "Paid";
      if (paymentMethod === "Corporate Purchase Order (Net-30)") {
        paymentStatus = "Verified";
      } else if (paymentMethod === "Bank Transfer (NEFT/RTGS)") {
        paymentStatus = "Awaiting Wire";
      } else if (paymentMethod === "Proforma Invoice / COD") {
        paymentStatus = "Pending Approval";
      }

      placeOrder({
        items: cart,
        customer: {
          ...customer,
          orderNotes: `${customer.orderNotes || ""}${
            paymentMethod === "Corporate Purchase Order (Net-30)"
              ? ` [PO #: ${poNumber}]`
              : utrNumber
              ? ` [UTR: ${utrNumber}]`
              : ""
          }`,
        },
        shippingMethod: selectedShipping,
        paymentMethod,
        paymentStatus,
        orderStatus: "Confirmed",
        subtotal: cartSubtotal,
        discount: cartDiscount,
        couponCode: activeCoupon?.code,
        tax: cartTax,
        shippingCost: cartShipping,
        total: cartTotal,
      });

      setIsSubmitting(false);
      setStep(1);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm transition-opacity"
        onClick={closeCheckout}
      />

      {/* Modal Card */}
      <div className="relative z-10 my-8 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white font-bold text-sm">
              QT
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-graphite">
                B2B Procurement &amp; Express Checkout
              </h2>
              <p className="text-xs text-muted-foreground">Qualitech Connectronics Verified Gateway</p>
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
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { num: 1, title: "1. Delivery Details" },
              { num: 2, title: "2. Shipping Mode" },
              { num: 3, title: "3. Payment Method" },
              { num: 4, title: "4. Review & Confirm" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => (s.num < step ? setStep(s.num as any) : undefined)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition-all ${
                  step === s.num
                    ? "bg-brand-blue text-white shadow-xs"
                    : step > s.num
                    ? "bg-emerald-50 text-emerald-700 cursor-pointer"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                <span>{step > s.num ? "✓" : s.num}</span>
                <span className="hidden sm:inline">{s.title.replace(/^\d\.\s/, "")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="max-h-[calc(85vh-160px)] overflow-y-auto p-6 sm:p-8">
          {/* STEP 1: Customer & Company Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Buyer &amp; Consignee Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter delivery coordinates and company details for GST invoice.
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
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-graphite mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={customer.companyName || ""}
                    onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-blue">
                    GSTIN for 18% Input Tax Credit (ITC)
                  </label>
                  <span className="text-[0.65rem] text-muted-foreground">Optional for B2C</span>
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
                    className="w-full rounded-xl border border-border px-3 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite mb-1">
                  Testing / Marking Instructions
                </label>
                <input
                  type="text"
                  value={customer.orderNotes || ""}
                  onChange={(e) => setCustomer({ ...customer, orderNotes: e.target.value })}
                  placeholder="e.g. Include Certificate of Conformity (CoC) and Hipot test data"
                  className="w-full rounded-xl border border-border px-3.5 py-2 text-xs text-graphite focus:border-brand-blue focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
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
                  Continue to Shipping →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Shipping Method */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Select Logistics &amp; Dispatch Method
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shipments are handled with anti-static packaging and transit insurance.
                </p>
              </div>

              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => {
                  const isSelected = selectedShipping.id === opt.id;
                  const isFree = cartSubtotal >= 5000 && opt.id === "standard";

                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedShipping(opt)}
                      className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-blue bg-blue-50/40 shadow-xs ring-1 ring-brand-blue"
                          : "border-border hover:bg-steel-light/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_option"
                          checked={isSelected}
                          onChange={() => setSelectedShipping(opt)}
                          className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xs font-bold text-graphite">
                              {opt.name}
                            </span>
                            <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                              {opt.estimatedDays}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-display text-sm font-bold text-brand-blue">
                          {isFree || opt.cost === 0 ? "FREE" : formatINR(opt.cost)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-brand-blue px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all shadow-sm cursor-pointer"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Select Settlement &amp; Procurement Mode
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Supporting verified B2B Purchase Orders and Instant Online Payments.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "UPI / Razorpay (Instant)",
                    title: "UPI / Instant Gateway (Razorpay)",
                    desc: "Pay via Google Pay, PhonePe, Paytm, Cards, or NetBanking",
                    icon: "⚡",
                  },
                  {
                    id: "Corporate Purchase Order (Net-30)",
                    title: "Corporate Purchase Order (Net-30 Terms)",
                    desc: "For approved OEMs, defense contractors & registered business accounts",
                    icon: "📑",
                  },
                  {
                    id: "Bank Transfer (NEFT/RTGS)",
                    title: "Direct Bank Wire Transfer (NEFT / RTGS)",
                    desc: "Transfer to Qualitech Connectronics HDFC current account with UTR",
                    icon: "🏦",
                  },
                  {
                    id: "Proforma Invoice / COD",
                    title: "Proforma Invoice / COD",
                    desc: "Generate official proforma invoice for advance finance approval",
                    icon: "📦",
                  },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-blue bg-blue-50/40 shadow-xs ring-1 ring-brand-blue"
                          : "border-border hover:bg-steel-light/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{m.icon}</span>
                        <div className="flex-1">
                          <p className="font-display text-xs font-bold text-graphite">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                          className="h-4 w-4 text-brand-blue"
                        />
                      </div>

                      {/* Extra Sub-inputs */}
                      {isSelected && m.id === "Corporate Purchase Order (Net-30)" && (
                        <div className="mt-3 border-t border-border/70 pt-3">
                          <label className="block text-xs font-semibold text-graphite mb-1">
                            Purchase Order (PO) Reference Number *
                          </label>
                          <input
                            type="text"
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            placeholder="e.g. PO/QUAL/2026/044"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono uppercase text-graphite focus:border-brand-blue focus:outline-hidden"
                          />
                          <p className="mt-1 text-[0.65rem] text-muted-foreground">
                            Subject to standard Net-30 credit approval for verified industrial buyers.
                          </p>
                        </div>
                      )}

                      {isSelected && m.id === "UPI / Razorpay (Instant)" && (
                        <div className="mt-3 border-t border-border/70 pt-3 flex items-center justify-between bg-white p-3 rounded-lg border border-border/80">
                          <div>
                            <p className="text-xs font-bold text-graphite">UPI VPA Simulation</p>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="mt-1 rounded-md border border-border px-2 py-1 text-xs font-mono text-brand-blue"
                            />
                          </div>
                          <span className="rounded-md bg-emerald-100 px-2 py-1 text-[0.65rem] font-bold text-emerald-800">
                            Instant Auto-Verify
                          </span>
                        </div>
                      )}

                      {isSelected && m.id === "Bank Transfer (NEFT/RTGS)" && (
                        <div className="mt-3 border-t border-border/70 pt-3 space-y-2 bg-white p-3 rounded-lg border border-border/80 text-xs text-graphite">
                          <div className="grid grid-cols-2 gap-2 text-[0.68rem]">
                            <div>
                              <span className="text-muted-foreground">Account Name:</span>
                              <p className="font-bold">Qualitech Connectronics Pvt Ltd</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bank:</span>
                              <p className="font-bold">HDFC Bank, Cherlapally Branch</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Account No:</span>
                              <p className="font-mono font-bold">50200088912345</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IFSC Code:</span>
                              <p className="font-mono font-bold">HDFC0001234</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[0.68rem] font-semibold text-muted-foreground mb-0.5">
                              Bank UTR / Transaction Reference (Optional)
                            </label>
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              placeholder="e.g. UTR-HDFC-99887766"
                              className="w-full rounded-md border border-border px-2 py-1 text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-xl bg-brand-blue px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all shadow-sm cursor-pointer"
                >
                  Review Order Summary →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Final Order Verification
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm the order details before placing dispatch authorization.
                </p>
              </div>

              {/* Items Summary */}
              <div className="rounded-xl border border-border bg-steel-light/15 p-4 space-y-3">
                <p className="text-xs font-bold text-graphite uppercase tracking-wider">
                  Order Items ({cartCount})
                </p>
                <div className="divide-y divide-border/60 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.68rem] text-muted-foreground">
                          [{item.product.sku}]
                        </span>
                        <span className="font-bold text-graphite">{item.product.name}</span>
                        <span className="text-muted-foreground">x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-brand-blue">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Preview */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-border p-3.5 space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Consignee &amp; Delivery Address
                  </span>
                  <p className="font-bold text-graphite">{customer.fullName}</p>
                  {customer.companyName && (
                    <p className="text-brand-blue font-semibold">{customer.companyName}</p>
                  )}
                  {customer.gstin && (
                    <p className="font-mono text-[0.68rem] text-muted-foreground">GST: {customer.gstin}</p>
                  )}
                  <p className="text-muted-foreground">
                    {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
                  </p>
                  <p className="text-muted-foreground">Tel: {customer.phone}</p>
                </div>

                <div className="rounded-xl border border-border p-3.5 space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Logistics &amp; Terms
                  </span>
                  <p className="font-bold text-graphite">{selectedShipping.name}</p>
                  <p className="text-muted-foreground">{selectedShipping.estimatedDays}</p>
                  <div className="mt-2 pt-2 border-t border-border/70">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Payment
                    </span>
                    <p className="font-bold text-graphite">{paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Final Totals */}
              <div className="rounded-xl border border-border bg-steel-light/30 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-graphite">{formatINR(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatINR(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST 18% (Tax Invoice Provided)</span>
                  <span className="font-semibold text-graphite">{formatINR(cartTax)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Freight</span>
                  <span className="font-semibold text-graphite">
                    {cartShipping === 0 ? "FREE" : formatINR(cartShipping)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2 text-base">
                  <span className="font-display font-bold text-graphite">Total Payable</span>
                  <span className="font-display text-xl font-extrabold text-brand-blue">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(3)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing Order &amp; Generating Invoice...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize &amp; Place Order</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
