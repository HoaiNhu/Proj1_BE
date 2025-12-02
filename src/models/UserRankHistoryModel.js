const mongoose = require("mongoose");

/**
 * UserRankHistoryModel - Lưu lịch sử thăng hạng của user
 * Dùng để theo dõi khi nào user đạt rank mới
 */
const userRankHistorySchema = new mongoose.Schema(
  {
    // User ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Rank cũ
    oldRank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rank",
      default: null,
    },

    // Rank mới
    newRank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rank",
      required: true,
    },

    // Tổng chi tiêu tại thời điểm thăng hạng
    totalSpendingAtPromotion: {
      type: Number,
      required: true,
      default: 0,
    },

    // Voucher đã được gửi chưa
    voucherSent: {
      type: Boolean,
      default: false,
    },

    // Email đã được gửi chưa
    emailSent: {
      type: Boolean,
      default: false,
    },

    // Mã voucher được tặng (nếu có)
    voucherCode: {
      type: String,
      default: null,
    },

    // Ghi chú
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
userRankHistorySchema.index({ userId: 1, createdAt: -1 });
userRankHistorySchema.index({ newRank: 1 });

const UserRankHistory = mongoose.model(
  "UserRankHistory",
  userRankHistorySchema
);
module.exports = UserRankHistory;
