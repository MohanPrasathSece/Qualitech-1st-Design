import nodemailer from "nodemailer";

async function testSMTP() {
  console.log("Connecting to Gmail SMTP server...");
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

  try {
    const verifyResult = await transporter.verify();
    console.log("SMTP Connection & Authentication Verified:", verifyResult);

    const info = await transporter.sendMail({
      from: '"Qualitech Connectronics" <zyradigitalsofficial@gmail.com>',
      to: "zyradigitalsofficial@gmail.com",
      subject: "Qualitech Connectronics - SMTP Mail Server Setup Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #004f9e; margin-top: 0;">SMTP Setup Successfully Configured</h2>
          <p>This is an automated verification email confirming that the Gmail SMTP server is actively connected and sending notifications for <strong>Qualitech Connectronics</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <ul style="line-height: 1.8;">
            <li><strong>SMTP User:</strong> zyradigitalsofficial@gmail.com</li>
            <li><strong>SMTP Host:</strong> smtp.gmail.com (Port 465 SSL)</li>
            <li><strong>All Admin & Customer Emails Active:</strong> Order Confirmations, Shipping Updates, Contact Form Inquiries, Custom RFQs</li>
          </ul>
        </div>
      `,
    });

    console.log("Test email successfully sent! Message ID:", info.messageId);
  } catch (err) {
    console.error("SMTP Test Error:", err);
  }
}

testSMTP();
