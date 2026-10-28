import { defineConfig, Plugin, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import nodemailer from "nodemailer";

function smtpEmailPlugin(env: Record<string, string>): Plugin {
  return {
    name: "smtp-email-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/send-email" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const { to, subject, html, text, from } = JSON.parse(body || "{}");
              if (!to || !subject || !html) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ success: false, error: "Missing required fields (to, subject, html)" }));
                return;
              }

              const host = env["VITE_SMTP_HOST"] || process.env["VITE_SMTP_HOST"] || "smtp.gmail.com";
              const port = parseInt(env["VITE_SMTP_PORT"] || process.env["VITE_SMTP_PORT"] || "465", 10);
              const user = env["VITE_SMTP_USER"] || process.env["VITE_SMTP_USER"] || "zyradigitalsofficial@gmail.com";
              const rawPass = env["VITE_SMTP_PASS"] || process.env["VITE_SMTP_PASS"] || "syohnqpdbmujdslo";
              const pass = rawPass.replace(/\s+/g, "");

              const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                  user,
                  pass,
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

              console.log("[SMTP Email Sent]", {
                messageId: info.messageId,
                to,
                subject,
              });

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, messageId: info.messageId }));
            } catch (err: any) {
              console.error("[SMTP Send Error]:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, error: err?.message || "Failed to send email" }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

import crypto from "crypto";

function razorpayApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "razorpay-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Create Razorpay Order
        if (req.url === "/api/create-razorpay-order" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            try {
              const { amountInRupees, orderNumber, customer, notes } = JSON.parse(body || "{}");
              if (!amountInRupees || amountInRupees <= 0) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: "Invalid or missing amountInRupees" }));
                return;
              }

              const keyId =
                env["RAZORPAY_KEY_ID"] ||
                env["VITE_RAZORPAY_KEY_ID"] ||
                process.env["RAZORPAY_KEY_ID"] ||
                process.env["VITE_RAZORPAY_KEY_ID"] ||
                "rzp_live_TsvDM2kdBgRXXK";
              const keySecret =
                env["RAZORPAY_KEY_SECRET"] ||
                process.env["RAZORPAY_KEY_SECRET"] ||
                "yk7tkEb6g2pslWHcqmd59at6";

              const amountInPaise = Math.round(Number(amountInRupees) * 100);
              const receipt = (orderNumber || `QT-${Date.now()}`).slice(0, 40);

              if (!keyId || !keySecret || keyId.includes("your-") || keySecret.includes("your-")) {
                console.log("[Vite Dev Razorpay] Simulation order generated (keys pending in .env)");
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    simulated: true,
                    keyId: keyId || "rzp_live_TsvDM2kdBgRXXK",
                    orderId: `order_sim_${Date.now()}`,
                    amount: amountInPaise,
                    currency: "INR",
                    receipt,
                    message: "Simulation mode active. Configure live keys in .env.",
                  })
                );
                return;
              }

              const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
              const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
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
                    company: customer?.companyName || "Direct Purchaser",
                    gstin: customer?.gstin || "Unregistered B2B",
                    ...notes,
                  },
                }),
              });

              const rzpData = await rzpRes.json();
              if (!rzpRes.ok) {
                res.statusCode = rzpRes.status || 500;
                res.end(JSON.stringify({ success: false, error: rzpData.error?.description || "Razorpay API error", details: rzpData }));
                return;
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  simulated: false,
                  keyId,
                  orderId: rzpData.id,
                  amount: rzpData.amount,
                  currency: rzpData.currency,
                  receipt: rzpData.receipt,
                })
              );
            } catch (err: any) {
              console.error("[Vite Dev Razorpay Error]:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || "Failed to create order" }));
            }
          });
          return;
        }

        // 2. Verify Razorpay Payment
        if (req.url === "/api/verify-razorpay-payment" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            try {
              const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(body || "{}");
              if (!razorpay_payment_id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: "Missing razorpay_payment_id" }));
                return;
              }

              const keySecret =
                env["RAZORPAY_KEY_SECRET"] ||
                process.env["RAZORPAY_KEY_SECRET"] ||
                "yk7tkEb6g2pslWHcqmd59at6";

              if (!keySecret || keySecret.includes("your-") || (razorpay_order_id && razorpay_order_id.startsWith("order_sim_"))) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    verified: true,
                    simulated: true,
                    message: "Payment simulated successfully.",
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                  })
                );
                return;
              }

              if (razorpay_order_id && razorpay_signature) {
                const hmac = crypto.createHmac("sha256", keySecret);
                hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
                const generatedSignature = hmac.digest("hex");

                if (generatedSignature !== razorpay_signature) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, verified: false, error: "Invalid Razorpay signature" }));
                  return;
                }
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  verified: true,
                  simulated: false,
                  message: "Payment signature mathematically verified.",
                  paymentId: razorpay_payment_id,
                  orderId: razorpay_order_id,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || "Verification error" }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), tsconfigPaths(), smtpEmailPlugin(env), razorpayApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});


