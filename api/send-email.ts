import type { IncomingMessage, ServerResponse } from "http";
import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const { to, subject, html, text, from } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ success: false, error: "Missing required fields: to, subject, html" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.VITE_SMTP_USER || "zyradigitalsofficial@gmail.com",
        pass: process.env.VITE_SMTP_PASS || "puhagpdbnnewacrs",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: from || '"Qualitech Connectronics" <zyradigitalsofficial@gmail.com>',
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text: text || undefined,
      html,
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("SMTP Delivery Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to send email",
    });
  }
}
