const mongoose = require("mongoose");

/**
 * RankModel - Quản lý các cấp rank trong hệ thống
 * Bao gồm: Bronze (Đồng), Silver (Bạc), Gold (Vàng)
 */
const rankSchema = new mongoose.Schema(
  {
    // Tên rank (Đồng, Bạc, Vàng)
    rankName: {
      type: String,
      required: true,
      unique: true,
      enum: ["Bronze", "Silver", "Gold"],
      trim: true,
    },

    // Tên hiển thị tiếng Việt
    rankDisplayName: {
      type: String,
      required: true,
      trim: true,
    },

    // Mã rank (RANK_BRONZE, RANK_SILVER, RANK_GOLD)
    rankCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Phần trăm giảm giá cho rank này (%)
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },

    // Hạn mức tối thiểu để đạt rank này (VNĐ)
    minSpending: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Hạn mức tối đa của rank này (VNĐ)
    // Null nếu không có giới hạn trên (rank cao nhất)
    maxSpending: {
      type: Number,
      default: null,
    },

    // Thứ tự ưu tiên của rank (1: thấp nhất, 3: cao nhất)
    priority: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    // Màu sắc đại diện cho rank (để hiển thị UI)
    color: {
      type: String,
      required: true,
      default: "#CD7F32", // Bronze color
    },

    // Icon hoặc badge cho rank
    icon: {
      type: String,
      default: "🥉",
    },

    // Các đặc quyền của rank (mô tả)
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],

    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true,
    },

    // Mô tả chi tiết về rank
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
rankSchema.index({ rankCode: 1 });
rankSchema.index({ priority: 1 });
rankSchema.index({ minSpending: 1, maxSpending: 1 });

// Method để kiểm tra một user có đạt rank này không
rankSchema.methods.isEligible = function (totalSpending) {
  if (this.maxSpending === null) {
    return totalSpending >= this.minSpending;
  }
  return totalSpending >= this.minSpending && totalSpending < this.maxSpending;
};

// Static method để tìm rank phù hợp với totalSpending
rankSchema.statics.findRankBySpending = async function (totalSpending) {
  const ranks = await this.find({ isActive: true }).sort({ priority: -1 });

  for (const rank of ranks) {
    if (rank.isEligible(totalSpending)) {
      return rank;
    }
  }

  // Nếu không tìm thấy rank nào, trả về rank thấp nhất
  return await this.findOne({ isActive: true }).sort({ priority: 1 });
};

const Rank = mongoose.model("Rank", rankSchema);
module.exports = Rank;
