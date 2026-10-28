import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers["x-razorpay-signature"];

    // If webhook secret configured, verify webhook signature
    if (webhookSecret && razorpaySignature) {
      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        console.error("[Razorpay Webhook]: Signature verification failed");
        return res.status(400).json({ success: false, error: "Invalid webhook signature" });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`[Razorpay Webhook Event Received]: ${event}`, {
      paymentId: payload?.payment?.entity?.id,
      orderId: payload?.order?.entity?.id,
      amount: payload?.payment?.entity?.amount,
      status: payload?.payment?.entity?.status,
    });

    // Handle key events
    switch (event) {
      case "payment.captured":
        // Payment was successfully captured
        break;
      case "payment.failed":
        console.warn("[Razorpay Webhook]: Payment failed for", payload?.payment?.entity?.id);
        break;
      case "order.paid":
        console.log("[Razorpay Webhook]: Order paid completely", payload?.order?.entity?.id);
        break;
      default:
        break;
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook Exception]:", error);
    return res.status(500).json({ success: false, error: error?.message || "Webhook error" });
  }
}
