const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo mỗi user chỉ đánh giá một lần cho mỗi sản phẩm trong một đơn hàng
ratingSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
