/**
 * Test script to verify voucher flow
 * Run this after making a test order with vouchers
 */

const mongoose = require("mongoose");
require("dotenv").config();

const UserVoucher = require("./src/models/UserVoucherModel");
const Voucher = require("./src/models/VoucherModel");
const VoucherUsageHistory = require("./src/models/VoucherUsageHistoryModel");
const Order = require("./src/models/OrderModel");

async function testVoucherFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ Connected to MongoDB");

    // Test 1: Check if voucher usedQuantity is updating
    const voucher = await Voucher.findOne({ voucherCode: "WINTER0010" });
    console.log("\n=== Voucher Check ===");
    console.log("Voucher Code:", voucher?.voucherCode);
    console.log("Total Quantity:", voucher?.totalQuantity);
    console.log("Claimed Quantity:", voucher?.claimedQuantity);
    console.log("Used Quantity:", voucher?.usedQuantity);

    // Test 2: Check UserVoucher records
    const userVouchers = await UserVoucher.find({
      voucherId: voucher?._id,
    }).populate("userId", "name email");
    console.log("\n=== UserVoucher Records ===");
    userVouchers.forEach((uv, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log("  User:", uv.userId?.name || uv.userId);
      console.log("  Status:", uv.status);
      console.log("  Order ID:", uv.orderId);
      console.log("  Used At:", uv.usedAt);
      console.log("  Claimed At:", uv.claimedAt);
    });

    // Test 3: Check VoucherUsageHistory records
    const usageHistory = await VoucherUsageHistory.find({
      voucherId: voucher?._id,
    }).populate("userId", "name email");
    console.log("\n=== VoucherUsageHistory Records ===");
    if (usageHistory.length === 0) {
      console.log("⚠ No usage history records found!");
    } else {
      usageHistory.forEach((history, idx) => {
        console.log(`\nHistory ${idx + 1}:`);
        console.log("  User:", history.userId?.name || history.userId);
        console.log("  Order ID:", history.orderId);
        console.log("  Voucher Code:", history.voucherCode);
        console.log("  Original Order Value:", history.originalOrderValue);
        console.log("  Discount Amount:", history.discountAmount);
        console.log("  Final Order Value:", history.finalOrderValue);
        console.log("  Used At:", history.usedAt);
      });
    }

    // Test 4: Check orders with vouchers
    const ordersWithVouchers = await Order.find({
      "vouchersUsed.0": { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(5);
    console.log("\n=== Recent Orders with Vouchers ===");
    ordersWithVouchers.forEach((order, idx) => {
      console.log(`\nOrder ${idx + 1}:`);
      console.log("  Order ID:", order._id);
      console.log("  Total Item Price:", order.totalItemPrice);
      console.log("  Voucher Discount:", order.voucherDiscount);
      console.log("  Total Price:", order.totalPrice);
      console.log("  Vouchers Used:", order.vouchersUsed.length);
      order.vouchersUsed.forEach((v, vIdx) => {
        console.log(`    Voucher ${vIdx + 1}:`, {
          code: v.voucherCode,
          discount: v.discountAmount,
        });
      });
    });

    console.log("\n✓ Test completed");
  } catch (error) {
    console.error("✗ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
  }
}

testVoucherFlow();
