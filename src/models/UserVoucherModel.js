const mongoose = require("mongoose");

const userVoucherSchema = new mongoose.Schema(
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

    // Trạng thái
    status: {
      type: String,
      enum: ["ACTIVE", "USED", "EXPIRED"],
      default: "ACTIVE",
    },

    // Thời gian claim và sử dụng
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    usedAt: {
      type: Date,
      default: null,
    },

    // Order liên quan (nếu đã dùng)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    // Expiry date (có thể khác với voucher.endDate)
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userVoucherSchema.index({ userId: 1, voucherId: 1 });
userVoucherSchema.index({ status: 1 });
userVoucherSchema.index({ expiresAt: 1 });

// Compound index để check user đã claim voucher chưa
userVoucherSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

// Virtual: check if expired
userVoucherSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

// Method: mark as used
userVoucherSchema.methods.markAsUsed = async function (orderId) {
  // Ensure orderId is an ObjectId
  const orderObjectId = mongoose.Types.ObjectId.isValid(orderId)
    ? new mongoose.Types.ObjectId(orderId)
    : orderId;

  this.status = "USED";
  this.usedAt = new Date();
  this.orderId = orderObjectId;

  console.log("markAsUsed - Setting orderId:", {
    original: orderId,
    converted: orderObjectId,
    type: typeof orderObjectId,
  });

  await this.save();

  console.log("markAsUsed - After save:", {
    orderId: this.orderId,
    status: this.status,
    usedAt: this.usedAt,
  });
};

// Method: mark as expired
userVoucherSchema.methods.markAsExpired = async function () {
  this.status = "EXPIRED";
  await this.save();
};

userVoucherSchema.set("toJSON", { virtuals: true });
userVoucherSchema.set("toObject", { virtuals: true });

const UserVoucher = mongoose.model("UserVoucher", userVoucherSchema);
module.exports = UserVoucher;
