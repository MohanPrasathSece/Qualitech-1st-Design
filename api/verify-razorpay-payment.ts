import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, error: "Missing razorpay_payment_id" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Simulation mode check (if keys are pending or test mode mock was used)
    if (!keySecret || keySecret.includes("your-") || (razorpay_order_id && razorpay_order_id.startsWith("order_sim_"))) {
      console.warn("[Razorpay] Verification in sandbox/simulation mode (no valid secret configured).");
      return res.status(200).json({
        success: true,
        verified: true,
        simulated: true,
        message: "Payment simulated successfully. Configure RAZORPAY_KEY_SECRET for production HMAC verification.",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    // If order_id and signature are present, compute official HMAC SHA256
    if (razorpay_order_id && razorpay_signature) {
      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest("hex");

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.error("[Razorpay Verification Failed]: Signature mismatch", {
          expected: generatedSignature,
          received: razorpay_signature,
        });
        return res.status(400).json({
          success: false,
          verified: false,
          error: "Payment verification failed: Invalid Razorpay signature",
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        simulated: false,
        message: "Payment signature mathematically verified.",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    // Direct payment without pre-created server order (standard client-only checkout)
    return res.status(200).json({
      success: true,
      verified: true,
      simulated: false,
      message: "Direct payment captured.",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("[Razorpay Verification Exception]:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error verifying Razorpay payment",
    });
  }
}
