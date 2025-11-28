require("dotenv").config();
const mongoose = require("mongoose");
const EmailService = require("./src/services/EmailService");

/**
 * Test Email Notifications với đơn hàng thật
 * Usage:
 * - Test confirmation: node test-order-email.js confirmation <orderId>
 * - Test status update: node test-order-email.js status <orderId> <oldStatus> <newStatus>
 */

const testEmailNotifications = async () => {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to MongoDB\n");

    const args = process.argv.slice(2);
    const testType = args[0]; // 'confirmation' or 'status'
    const orderId = args[1];

    if (!testType || !orderId) {
      console.log("📝 Usage:");
      console.log("  Test confirmation email:");
      console.log("    node test-order-email.js confirmation <orderId>");
      console.log("\n  Test status update email:");
      console.log(
        "    node test-order-email.js status <orderId> <oldStatus> <newStatus>"
      );
      console.log("\n  Example:");
      console.log(
        "    node test-order-email.js confirmation 6756c3a8e9b1234567890abc"
      );
      console.log(
        "    node test-order-email.js status 6756c3a8e9b1234567890abc PENDING DELIVERING"
      );
      process.exit(0);
    }

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error("❌ Invalid order ID format");
      process.exit(1);
    }

    if (testType === "confirmation") {
      // Test Order Confirmation Email
      console.log("📧 Testing Order Confirmation Email...");
      console.log(`Order ID: ${orderId}\n`);

      const result = await EmailService.sendOrderConfirmationEmail(orderId);

      if (result.success) {
        console.log("✅ Email sent successfully!");
        console.log(`📬 Message ID: ${result.messageId}`);
      } else {
        console.error("❌ Failed to send email:", result.message);
      }
    } else if (testType === "status") {
      // Test Status Update Email
      const oldStatus = args[2] || "PENDING";
      const newStatus = args[3] || "PROCESSING";

      console.log("🔔 Testing Order Status Update Email...");
      console.log(`Order ID: ${orderId}`);
      console.log(`Status Change: ${oldStatus} → ${newStatus}\n`);

      const result = await EmailService.sendOrderStatusUpdateEmail(
        orderId,
        oldStatus,
        newStatus
      );

      if (result.success) {
        console.log("✅ Email sent successfully!");
        console.log(`📬 Message ID: ${result.messageId}`);
      } else {
        console.error("❌ Failed to send email:", result.message);
      }
    } else {
      console.error("❌ Invalid test type. Use 'confirmation' or 'status'");
      process.exit(1);
    }

    // Disconnect
    await mongoose.disconnect();
    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run test
testEmailNotifications();
