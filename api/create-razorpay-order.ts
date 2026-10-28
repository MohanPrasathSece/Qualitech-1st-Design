import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const { amountInRupees, orderNumber, customer, notes } = req.body || {};

    if (!amountInRupees || amountInRupees <= 0) {
      return res.status(400).json({ success: false, error: "Invalid or missing amountInRupees" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(Number(amountInRupees) * 100);
    const receipt = (orderNumber || `QT-${Date.now()}`).slice(0, 40);

    // If keys are not configured yet, return a structured simulation order so frontend tests seamlessly
    if (!keyId || !keySecret || keyId.includes("your-") || keySecret.includes("your-")) {
      console.warn("[Razorpay] Live/Test keys not configured in environment. Using sandbox simulation mode.");
      return res.status(200).json({
        success: true,
        simulated: true,
        keyId: keyId || "rzp_test_placeholder",
        orderId: `order_sim_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        receipt,
        message: "Razorpay keys not yet configured. Simulated order returned.",
      });
    }

    // Call official Razorpay Orders API
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          orderNumber: orderNumber || receipt,
          customerName: customer?.fullName || "Valued Buyer",
          customerEmail: customer?.email || "",
          customerPhone: customer?.phone || "",
          company: customer?.companyName || "Direct Purchaser",
          gstin: customer?.gstin || "Unregistered B2B",
          ...notes,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Razorpay Order API Error]:", data);
      return res.status(response.status || 500).json({
        success: false,
        error: data.error?.description || "Failed to create Razorpay order",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      simulated: false,
      keyId,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
    });
  } catch (error: any) {
    console.error("[Razorpay Create Order Exception]:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error creating Razorpay order",
    });
  }
}
