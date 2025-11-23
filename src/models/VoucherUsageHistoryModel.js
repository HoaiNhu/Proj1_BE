const mongoose = require("mongoose");

const voucherUsageHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    userVoucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserVoucher",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Chi tiết giảm giá
    originalOrderValue: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    finalOrderValue: {
      type: Number,
      required: true,
    },

    // Metadata
    usedAt: {
      type: Date,
      default: Date.now,
    },
    voucherCode: {
      type: String,
      required: true,
    },
    voucherType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
voucherUsageHistorySchema.index({ userId: 1, voucherId: 1 });
voucherUsageHistorySchema.index({ orderId: 1 });
voucherUsageHistorySchema.index({ usedAt: -1 });

const VoucherUsageHistory = mongoose.model(
  "VoucherUsageHistory",
  voucherUsageHistorySchema
);
module.exports = VoucherUsageHistory;
