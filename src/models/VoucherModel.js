const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    voucherCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    voucherName: {
      type: String,
      required: true,
      trim: true,
    },
    voucherDescription: {
      type: String,
      required: true,
    },
    voucherImage: {
      type: String,
      default: null,
    },

    // Loại voucher
    voucherType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING", "COMBO"],
      required: true,
    },

    // Giá trị voucher
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number, // Giảm tối đa (cho type PERCENTAGE)
      default: null,
    },

    // Điều kiện áp dụng
    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn hàng tối thiểu
    },
    applicableProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [], // Rỗng = áp dụng cho tất cả
    },
    applicableCategories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [], // Rỗng = áp dụng cho tất cả
    },

    // Thời gian hiệu lực
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Giới hạn số lượng
    totalQuantity: {
      type: Number,
      required: true, // Tổng số voucher có thể phát hành
    },
    claimedQuantity: {
      type: Number,
      default: 0, // Số lượng đã được claim
    },
    usedQuantity: {
      type: Number,
      default: 0, // Số lượng đã được sử dụng
    },

    // Giới hạn sử dụng
    usageLimitPerUser: {
      type: Number,
      default: 1, // Mỗi user chỉ được dùng 1 lần
    },
    isPublic: {
      type: Boolean,
      default: true, // Public = hiển thị cho mọi người, Private = chỉ gửi qua email
    },

    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    tags: {
      type: [String],
      default: [], // VD: ["NEW_USER", "FLASH_SALE", "BIRTHDAY"]
    },
    priority: {
      type: Number,
      default: 0, // Priority cao hơn = áp dụng trước (khi stack vouchers)
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
voucherSchema.index({ voucherCode: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });
voucherSchema.index({ isActive: 1, isPublic: 1 });
voucherSchema.index({ tags: 1 });

// Validation: startDate < endDate
voucherSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    return next(new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!"));
  }
  next();
});

// Virtual: còn lại bao nhiêu voucher
voucherSchema.virtual("remainingQuantity").get(function () {
  return this.totalQuantity - this.claimedQuantity;
});

// Virtual: check if expired
voucherSchema.virtual("isExpired").get(function () {
  return new Date() > this.endDate;
});

// Virtual: check if available
voucherSchema.virtual("isAvailable").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    this.claimedQuantity < this.totalQuantity
  );
});

// Method: check if voucher can be claimed
voucherSchema.methods.canBeClaimed = function () {
  return this.isAvailable && this.claimedQuantity < this.totalQuantity;
};

// Method: increment claimed quantity
voucherSchema.methods.incrementClaimed = async function () {
  this.claimedQuantity += 1;
  await this.save();
};

// Method: increment used quantity
voucherSchema.methods.incrementUsed = async function () {
  console.log("incrementUsed - Before:", {
    voucherId: this._id,
    usedQuantity: this.usedQuantity,
  });

  this.usedQuantity += 1;
  await this.save();

  console.log("incrementUsed - After:", {
    voucherId: this._id,
    usedQuantity: this.usedQuantity,
  });
};

voucherSchema.set("toJSON", { virtuals: true });
voucherSchema.set("toObject", { virtuals: true });

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
