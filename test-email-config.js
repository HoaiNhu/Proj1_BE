require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Test Email Configuration
 * Kiểm tra xem SMTP credentials có hoạt động không
 */

async function testEmailConfig() {
  console.log("🧪 Testing Email Configuration...\n");

  // Kiểm tra ENV variables
  console.log("📋 Checking Environment Variables:");
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? "✅ Set" : "❌ Not set"}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set"}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM ? "✅ Set" : "❌ Not set"}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env file");
    process.exit(1);
  }

  // Test SMTP connection
  console.log("🔌 Testing SMTP Connection...");
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP Connection successful!\n");
  } catch (error) {
    console.error("❌ SMTP Connection failed:", error.message);
    process.exit(1);
  }

  // Send test email
  console.log("📧 Sending test email...");
  const testEmail = process.argv[2] || process.env.EMAIL_FROM;

  try {
    const info = await transporter.sendMail({
      from: `"Avocado Cake Shop 🎂" <${process.env.EMAIL_FROM}>`,
      to: testEmail,
      subject: "✅ Test Email - Avocado Cake Shop",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #667eea;">🎉 Email Configuration Test</h1>
            <p style="color: #666; line-height: 1.6;">
              If you receive this email, your email configuration is working correctly!
            </p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
              <strong style="color: #155724;">✅ SMTP Connection: Success</strong><br/>
              <span style="color: #155724;">Your Brevo SMTP credentials are valid.</span>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Sent at: ${new Date().toLocaleString("vi-VN")}<br/>
              From: Avocado Cake Shop Email Service
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${testEmail}\n`);
    console.log("🎉 All tests passed! Email system is ready to use.");
  } catch (error) {
    console.error("❌ Failed to send test email:", error.message);
    process.exit(1);
  }
}

// Run tests
testEmailConfig().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
