/**
 * Razorpay Payment Gateway Integration for Qualitech Connectronics
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentOptions {
  amountInRupees: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  notes?: Record<string, string> | undefined;
  onSuccess: (paymentId: string, orderId?: string | undefined) => void;
  onFailure?: ((error: any) => void) | undefined;
  onDismiss?: (() => void) | undefined;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout script");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay payment popup
 */
export async function openRazorpayCheckout({
  amountInRupees,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  companyName,
  gstin,
  notes,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayPaymentOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
    if (onFailure) onFailure(new Error("Razorpay script load failed"));
    return;
  }

  // Use environment key or default test identifier
  const key = (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string) || "rzp_test_1DP5mmOlF5G5ag";

  const options = {
    key,
    amount: Math.round(amountInRupees * 100), // Amount in paise
    currency: "INR",
    name: "Qualitech Connectronics Pvt Ltd",
    description: `Order #${orderNumber} - Industrial Interconnects & Assemblies`,
    image: window.location.origin + "/logo.png",
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone.replace(/[^0-9+]/g, ""),
    },
    notes: {
      orderNumber,
      company: companyName || "Direct Purchaser",
      gstin: gstin || "Unregistered B2B",
      ...notes,
    },
    theme: {
      color: "#004f9e", // Brand blue
      backdrop_color: "rgba(10, 15, 29, 0.7)",
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
      confirm_close: true,
      animation: true,
    },
    handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
      onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      console.error("Razorpay Payment Failed:", response.error);
      if (onFailure) onFailure(response.error);
    });
    rzp.open();
  } catch (err) {
    console.error("Error launching Razorpay:", err);
    if (onFailure) onFailure(err);
  }
}
