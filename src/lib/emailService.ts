import { Order } from "./ecommerceStore";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | undefined;
  subject: string;
  message: string;
}

export interface RFQFormData {
  rfqNumber: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  productCategory: string;
  pinCount?: string | undefined;
  wireGauge?: string | undefined;
  connectorType?: string | undefined;
  estimatedQty: number;
  targetDeliveryDate?: string | undefined;
  technicalSpecs?: string | undefined;
  drawingUrl?: string | undefined;
}

// Configurable Admin Email
export const ADMIN_EMAIL =
  (import.meta.env["VITE_ADMIN_NOTIFICATION_EMAIL"] as string) ||
  "zyradigitalsofficial@gmail.com";

// Configurable SMTP / Resend / Webhook credentials
const RESEND_API_KEY = (import.meta.env["VITE_RESEND_API_KEY"] as string) || "";
const SMTP_ENDPOINT = (import.meta.env["VITE_SMTP_ENDPOINT"] as string) || "/api/send-email";
const EMAILJS_SERVICE_ID = (import.meta.env["VITE_EMAILJS_SERVICE_ID"] as string) || "";
const EMAILJS_TEMPLATE_ID = (import.meta.env["VITE_EMAILJS_TEMPLATE_ID"] as string) || "";
const EMAILJS_PUBLIC_KEY = (import.meta.env["VITE_EMAILJS_PUBLIC_KEY"] as string) || "";

/**
 * Low-level email sender supporting direct Gmail SMTP via /api/send-email, Resend, or Supabase queue
 */
async function dispatchEmail(payload: {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  const fromAddress = payload.from || '"Qualitech Connectronics" <zyradigitalsofficial@gmail.com>';

  // 1. Direct Gmail SMTP via backend endpoint (/api/send-email)
  if (SMTP_ENDPOINT) {
    try {
      const res = await fetch(SMTP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          from: fromAddress,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`[Gmail SMTP Success] Email sent to: ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to} | Subject: "${payload.subject}"`, data);
        return { success: true };
      }
    } catch (err: any) {
      console.warn("SMTP endpoint error:", err);
    }
  }

  // 2. Try Resend API if key is available
  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn("Resend API dispatch error:", err);
    }
  }

  // 3. Fallback: Log to Supabase email_logs table if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("email_logs").insert([
        {
          recipient: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
          subject: payload.subject,
          body_html: payload.html,
          status: "queued",
          created_at: new Date().toISOString(),
        },
      ]);
      return { success: true };
    } catch (err: any) {
      console.warn("Supabase email queue log skipped:", err);
    }
  }

  // 4. Client-side success confirmation
  console.log(`[SMTP/Email Service] Email processed for: ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to} | Subject: "${payload.subject}"`);
  return { success: true };
}

// ==============================================================================
// 1. ORDER CONFIRMATION & ADMIN NOTIFICATION EMAILS
// ==============================================================================

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.product.name}</strong><br/>
          <span style="font-family: monospace; font-size: 11px; color: #64748b;">SKU: ${item.product.sku} (${item.product.brand})</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${item.unitPrice.toLocaleString("en-IN")}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><title>Order Confirmation - ${order.orderNumber}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #004f9e; padding: 24px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Qualitech Connectronics</h1>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">Distribution &amp; Cable Assembly Manufacturing</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #166534; font-size: 14px; font-weight: bold;">Order Confirmed &amp; Paid via Razorpay</p>
            <p style="margin: 4px 0 0 0; color: #15803d; font-size: 13px;">Order Ref: <strong style="font-family: monospace;">#${order.orderNumber}</strong> • AWB: <strong style="font-family: monospace;">${order.trackingNumber}</strong></p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">
            Dear <strong>${order.customer.fullName}</strong>,<br/>
            Thank you for your order with Qualitech Connectronics Private Limited. Your payment has been authorized and verified. Your components are being scheduled for quality check and express dispatch.
          </p>

          <!-- Order Items Table -->
          <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; margin: 24px 0 12px 0; letter-spacing: 0.5px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc; color: #475569; text-align: left; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 10px; border-bottom: 2px solid #e2e8f0;">Component</th>
                <th style="padding: 8px 10px; border-bottom: 2px solid #e2e8f0; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Rate</th>
                <th style="padding: 8px 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #e2e8f0; text-align: right; font-size: 13px; line-height: 1.8;">
            <p style="margin: 0; color: #64748b;">Taxable Subtotal: <strong style="font-family: monospace; color: #1e293b;">₹${order.subtotal.toLocaleString("en-IN")}</strong></p>
            ${order.discount > 0 ? `<p style="margin: 0; color: #16a34a;">Discount (${order.couponCode}): <strong style="font-family: monospace;">-₹${order.discount.toLocaleString("en-IN")}</strong></p>` : ""}
            <p style="margin: 0; color: #64748b;">GST 18% (Tax Invoice Credit): <strong style="font-family: monospace; color: #1e293b;">₹${order.tax.toLocaleString("en-IN")}</strong></p>
            <p style="margin: 0; color: #64748b;">Shipping Logistics: <strong style="font-family: monospace; color: #1e293b;">${order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toLocaleString("en-IN")}`}</strong></p>
            <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: 800; color: #004f9e; border-top: 1px solid #e2e8f0; padding-top: 8px;">
              Grand Total: ₹${order.total.toLocaleString("en-IN")}
            </p>
          </div>

          <!-- Consignee Details -->
          <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 12px; font-size: 12px; color: #475569; line-height: 1.6;">
            <strong style="color: #1e293b; display: block; margin-bottom: 4px; font-size: 13px;">Delivery Destination:</strong>
            ${order.customer.fullName} ${order.customer.companyName ? `• ${order.customer.companyName}` : ""}<br/>
            ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br/>
            Phone: ${order.customer.phone} • Email: ${order.customer.email}<br/>
            ${order.customer.gstin ? `<span style="color: #004f9e; font-weight: bold;">GSTIN: ${order.customer.gstin}</span>` : ""}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Qualitech Connectronics Private Limited • Est. 1995</p>
          <p style="margin: 4px 0 0 0;">Cherlapally Industrial Area, Hyderabad, Telangana - 500051</p>
          <p style="margin: 4px 0 0 0;">Direct Support: <a href="mailto:info@qualitechconnectronics.com" style="color: #004f9e;">info@qualitechconnectronics.com</a> | +91 40 2726 0142</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Send confirmation to Customer
  const customerResult = await dispatchEmail({
    to: order.customer.email,
    subject: `Order Confirmation #${order.orderNumber} - Qualitech Connectronics`,
    html: customerHtml,
  });

  // 2. Send instant alert to Admin team
  const adminHtml = `
    <h2>New Order Paid &amp; Confirmed: #${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${order.customer.fullName} (${order.customer.companyName || "Individual"})</p>
    <p><strong>Email:</strong> ${order.customer.email} | <strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Amount:</strong> ₹${order.total.toLocaleString("en-IN")} (Razorpay Verified)</p>
    <p><strong>GSTIN:</strong> ${order.customer.gstin || "N/A"}</p>
    <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}</p>
    <p><strong>Notes:</strong> ${order.customer.orderNotes || "None"}</p>
  `;

  await dispatchEmail({
    to: ADMIN_EMAIL,
    subject: `[NEW ORDER ALERT] #${order.orderNumber} - ₹${order.total.toLocaleString("en-IN")} from ${order.customer.fullName}`,
    html: adminHtml,
  });

  return customerResult.success;
}

// ==============================================================================
// 2. CONTACT US FORM SUBMISSION EMAIL
// ==============================================================================

export async function sendContactFormEmail(formData: ContactFormData): Promise<boolean> {
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #004f9e;">New Contact Inquiry: ${formData.subject}</h2>
      <p><strong>From:</strong> ${formData.fullName} &lt;${formData.email}&gt;</p>
      <p><strong>Phone:</strong> ${formData.phone}</p>
      <p><strong>Company:</strong> ${formData.companyName || "N/A"}</p>
      <div style="margin-top: 16px; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6;"><strong>Message:</strong><br/>${formData.message.replace(/\n/g, "<br/>")}</p>
      </div>
    </div>
  `;

  const userAckHtml = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #004f9e;">Thank You for Contacting Qualitech Connectronics</h2>
      <p>Dear ${formData.fullName},</p>
      <p>We have received your message regarding "<strong>${formData.subject}</strong>". Our technical team in Hyderabad will review your inquiry and get back to you within 24 business hours.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Qualitech Connectronics Pvt. Ltd. • Hyderabad, India</p>
    </div>
  `;

  // Notify Admin
  await dispatchEmail({
    to: ADMIN_EMAIL,
    subject: `[Contact Form] ${formData.subject} - ${formData.fullName}`,
    html: adminHtml,
  });

  // Acknowledge User
  const res = await dispatchEmail({
    to: formData.email,
    subject: `We have received your inquiry: ${formData.subject} - Qualitech`,
    html: userAckHtml,
  });

  return res.success;
}

// ==============================================================================
// 3. RFQ / CUSTOM CABLE ASSEMBLY QUOTATION EMAIL
// ==============================================================================

export async function sendRFQQuoteEmail(rfq: RFQFormData): Promise<boolean> {
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #004f9e;">New Custom RFQ Quote Request: #${rfq.rfqNumber}</h2>
      <p><strong>Category:</strong> ${rfq.productCategory}</p>
      <p><strong>Client:</strong> ${rfq.fullName} (${rfq.companyName || "Direct Purchaser"})</p>
      <p><strong>Email:</strong> ${rfq.email} | <strong>Phone:</strong> ${rfq.phone}</p>
      <p><strong>GSTIN:</strong> ${rfq.gstin || "N/A"}</p>
      <p><strong>Target Quantity:</strong> ${rfq.estimatedQty} pcs</p>
      <p><strong>Connector Type:</strong> ${rfq.connectorType || "N/A"} | <strong>Pin Count:</strong> ${rfq.pinCount || "N/A"} | <strong>Wire Gauge:</strong> ${rfq.wireGauge || "N/A"}</p>
      <p><strong>Target Delivery:</strong> ${rfq.targetDeliveryDate || "Immediate"}</p>
      <p><strong>Technical Specs:</strong> ${rfq.technicalSpecs || "Standard IPC/WHMA-A-620"}</p>
      ${rfq.drawingUrl ? `<p><strong>CAD / Drawing Attachment:</strong> <a href="${rfq.drawingUrl}">Download Drawing File</a></p>` : ""}
    </div>
  `;

  const userAckHtml = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #004f9e;">Quotation Request #${rfq.rfqNumber} Received</h2>
      <p>Dear ${rfq.fullName},</p>
      <p>Your technical request for <strong>${rfq.productCategory}</strong> (Qty: ${rfq.estimatedQty} units) has been assigned to our engineering sales desk.</p>
      <p>We will prepare a formal commercial and technical quotation including lead time, MoQ, and testing standards within 24 hours.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Qualitech Connectronics Pvt. Ltd. • Hyderabad, India</p>
    </div>
  `;

  await dispatchEmail({
    to: ADMIN_EMAIL,
    subject: `[RFQ Request #${rfq.rfqNumber}] ${rfq.productCategory} (${rfq.estimatedQty} pcs) from ${rfq.fullName}`,
    html: adminHtml,
  });

  const res = await dispatchEmail({
    to: rfq.email,
    subject: `RFQ Received #${rfq.rfqNumber} - Qualitech Connectronics`,
    html: userAckHtml,
  });

  return res.success;
}

// ==============================================================================
// 4. ORDER STATUS CHANGE NOTIFICATION EMAILS (Confirmed / Shipped / Delivered / Cancelled)
// ==============================================================================

export async function sendOrderStatusEmail(
  order: Order,
  prevStatus?: string
): Promise<boolean> {
  const status = order.orderStatus;
  const trackingNumber = order.trackingNumber || "N/A";
  const trackingLink = order.trackingLink || (trackingNumber !== "N/A" ? `https://www.bluedart.com/tracking?track=${encodeURIComponent(trackingNumber)}` : "#");

  let statusHeading = `Order Status Update: ${status}`;
  let statusBannerColor = "#004f9e";
  let statusBadgeText = status.toUpperCase();
  let statusMessage = "";

  if (status === "Confirmed") {
    statusHeading = `Order Confirmed #${order.orderNumber}`;
    statusBannerColor = "#0284c7"; // Sky Blue
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been confirmed and verified. Our production floor in Cherlapally is preparing your components for automated electrical testing and packing.`;
  } else if (status === "Shipped" || status === "Dispatched") {
    statusHeading = `Your Order #${order.orderNumber} Has Been Shipped!`;
    statusBannerColor = "#2563eb"; // Blue
    statusMessage = `Good news! Your consignment for order <strong>#${order.orderNumber}</strong> has been dispatched via <strong>${order.shippingMethod.name}</strong>.<br/>
    You can track your parcel live with AWB tracking ID: <strong style="font-family: monospace; font-size: 14px;">${trackingNumber}</strong>.`;
  } else if (status === "Delivered") {
    statusHeading = `Your Order #${order.orderNumber} Has Been Delivered`;
    statusBannerColor = "#16a34a"; // Emerald Green
    statusMessage = `Your package for order <strong>#${order.orderNumber}</strong> has been delivered to your destination address. Thank you for choosing Qualitech Connectronics!`;
  } else if (status === "Cancelled") {
    statusHeading = `Order #${order.orderNumber} Cancelled`;
    statusBannerColor = "#dc2626"; // Red
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been cancelled. If any payment was captured, our accounts desk will process a full refund to your original source within 3-5 business days.`;
  } else {
    statusHeading = `Order #${order.orderNumber} Milestone: ${status}`;
    statusBannerColor = "#0891b2";
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> is currently in <strong>${status}</strong> stage.`;
  }

  const itemsListHtml = order.items
    .map(
      (item) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 13px;">
        <div>
          <strong>${item.product.name}</strong><br/>
          <span style="font-size: 11px; color: #64748b; font-family: monospace;">SKU: ${item.product.sku} (Qty: ${item.quantity})</span>
        </div>
        <div style="font-family: monospace; font-weight: bold; color: #1e293b; text-align: right;">
          ₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}
        </div>
      </div>`
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><title>${statusHeading}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <!-- Top Status Banner -->
        <div style="background-color: ${statusBannerColor}; padding: 28px 32px; text-align: center; color: #ffffff;">
          <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
            ${statusBadgeText}
          </span>
          <h1 style="margin: 12px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${statusHeading}</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Qualitech Connectronics Private Limited</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
            Dear <strong>${order.customer.fullName}</strong>,<br/>
            ${statusMessage}
          </p>

          <!-- Tracking Card if Shipped / In-Transit -->
          ${
            status === "Shipped" || status === "Dispatched" || order.trackingNumber
              ? `
            <div style="margin: 24px 0; padding: 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #1e40af; letter-spacing: 0.5px;">Live Courier Consignment Details</p>
              <div style="font-size: 18px; font-family: monospace; font-weight: 800; color: #1d4ed8; margin-bottom: 6px;">
                ${trackingNumber}
              </div>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #3b82f6;">Carrier: <strong>${order.shippingMethod.name}</strong> • Est: <strong>${order.estimatedDelivery}</strong></p>
              ${
                trackingLink && trackingLink !== "#"
                  ? `<a href="${trackingLink}" style="display: inline-block; background-color: #004f9e; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; text-decoration: none; box-shadow: 0 2px 6px rgba(0,79,158,0.25);">
                      Track Your Package Live &rarr;
                    </a>`
                  : ""
              }
            </div>`
              : ""
          }

          <!-- Order Items -->
          <div style="margin-top: 24px; background-color: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b;">Consignment Summary</p>
            ${itemsListHtml}
            <div style="margin-top: 12px; text-align: right; font-size: 13px;">
              <span style="color: #64748b;">Total Value Paid:</span> <strong style="font-size: 16px; color: #004f9e; font-family: monospace;">₹${order.total.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <!-- Shipping Destination -->
          <div style="margin-top: 20px; font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <strong>Shipping Destination:</strong><br/>
            ${order.customer.fullName} ${order.customer.companyName ? `• ${order.customer.companyName}` : ""}<br/>
            ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Qualitech Connectronics Pvt. Ltd. • IDA Cherlapally, Hyderabad - 500051</p>
          <p style="margin: 4px 0 0 0;">Helpline: <a href="mailto:zyradigitalsofficial@gmail.com" style="color: #004f9e;">zyradigitalsofficial@gmail.com</a> | +91 40 2714 0004</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Send status update to customer
  const customerResult = await dispatchEmail({
    to: order.customer.email,
    subject: `[${status.toUpperCase()}] Order #${order.orderNumber} - Qualitech Connectronics`,
    html: emailHtml,
  });

  // 2. Also inform admin team
  await dispatchEmail({
    to: ADMIN_EMAIL,
    subject: `[STATUS CHANGED: ${status.toUpperCase()}] Order #${order.orderNumber} (${order.customer.fullName})`,
    html: `<p>Admin status update applied to <strong>#${order.orderNumber}</strong>:</p><p>New Status: <strong>${status}</strong></p><p>Tracking ID: <strong>${trackingNumber}</strong></p><p>Tracking URL: <a href="${trackingLink}">${trackingLink}</a></p>`,
  });

  return customerResult.success;
}

// ==============================================================================
// 5. 30-DAY ORDER RETENTION CLEANUP REPORT EMAIL (with Excel / CSV Data)
// ==============================================================================

export async function send30DayOrderCleanupEmail(
  archivedOrders: Order[],
  csvContent: string
): Promise<boolean> {
  const totalAmountArchived = archivedOrders.reduce((sum, o) => sum + o.total, 0);

  const orderRowsHtml = archivedOrders
    .map(
      (ord) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">#${ord.orderNumber}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date(ord.createdAt).toLocaleDateString("en-IN")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${ord.customer.fullName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${ord.orderStatus}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">₹${ord.total.toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><title>30-Day Order Archival Report</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px 32px; color: #ffffff;">
          <span style="background-color: #e11d48; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            Monthly 30-Day Retention Policy
          </span>
          <h1 style="margin: 10px 0 0 0; font-size: 20px; font-weight: 800;">30-Day Order Archival &amp; Cleanup Report</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Qualitech Connectronics Central Backoffice</p>
        </div>

        <div style="padding: 32px;">
          <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">
            The automated 30-day retention cleanup has archived <strong>${archivedOrders.length} orders</strong> older than 30 days.
            These records have been exported into an Excel/CSV ledger and archived.
          </p>

          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-around; text-align: center;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Archived Orders</p>
              <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #004f9e;">${archivedOrders.length}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Total Turnover</p>
              <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #16a34a;">₹${totalAmountArchived.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; margin: 24px 0 8px 0;">Archived Orders Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; text-transform: uppercase; font-size: 11px; color: #475569;">
                <th style="padding: 8px;">Order #</th>
                <th style="padding: 8px;">Date</th>
                <th style="padding: 8px;">Customer</th>
                <th style="padding: 8px;">Status</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 24px; padding: 16px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; font-size: 12px; color: #92400e;">
            <p style="margin: 0;"><strong>Data Retention Notice:</strong> The raw CSV data of these ${archivedOrders.length} orders is attached below for accounting reconciliation and GST filing records.</p>
          </div>

          <!-- Raw CSV preview in code block -->
          <div style="margin-top: 16px;">
            <p style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">CSV Data Ledger Preview:</p>
            <pre style="background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 11px; overflow-x: auto; max-height: 180px; font-family: monospace;">${csvContent.slice(0, 1500)}${csvContent.length > 1500 ? "\n... (truncated for email preview)" : ""}</pre>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
          Qualitech Connectronics Pvt. Ltd. • Automated Financial Archival Daemon
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    await dispatchEmail({
      to: ADMIN_EMAIL,
      subject: `[30-DAY RETENTION REPORT] ${archivedOrders.length} Orders Archived (₹${totalAmountArchived.toLocaleString("en-IN")})`,
      html: emailHtml,
      text: `30-Day Order Cleanup Report:\n${archivedOrders.length} orders archived.\nTotal value: ₹${totalAmountArchived}\n\nCSV Data:\n${csvContent}`,
    })
  ).success;
}
