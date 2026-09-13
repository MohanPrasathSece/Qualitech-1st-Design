import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import nodemailer from "nodemailer";

function smtpEmailPlugin(): Plugin {
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

              const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: "zyradigitalsofficial@gmail.com",
                  pass: "puhagpdbnnewacrs",
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), smtpEmailPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

