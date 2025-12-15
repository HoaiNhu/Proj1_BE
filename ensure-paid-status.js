require("dotenv").config();
const mongoose = require("mongoose");
const Status = require("./src/models/StatusModel");

async function ensurePaidStatus() {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to MongoDB");

    // Kiểm tra status PAID
    const paidStatus = await Status.findOne({ statusCode: "PAID" });

    if (paidStatus) {
      console.log("✅ PAID status exists:", {
        _id: paidStatus._id,
        statusCode: paidStatus.statusCode,
        statusName: paidStatus.statusName,
      });
    } else {
      console.log("⚠️  PAID status not found. Creating...");

      const newPaidStatus = await Status.create({
        statusCode: "PAID",
        statusName: "Đã thanh toán",
        statusDescription: "Đơn hàng đã được thanh toán thành công",
      });

      console.log("✅ PAID status created:", {
        _id: newPaidStatus._id,
        statusCode: newPaidStatus.statusCode,
        statusName: newPaidStatus.statusName,
      });
    }

    // Hiển thị tất cả statuses
    console.log("\n📋 All statuses:");
    const allStatuses = await Status.find({}).sort({ createdAt: 1 });
    allStatuses.forEach((status, index) => {
      console.log(
        `${index + 1}. ${status.statusCode} - ${status.statusName} (${
          status._id
        })`
      );
    });

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

ensurePaidStatus();
