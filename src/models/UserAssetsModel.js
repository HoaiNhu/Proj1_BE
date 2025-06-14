// models/userAssets.js
const mongoose = require("mongoose");

const userAssetsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    coins: { type: Number, default: 0 }, // Xu - 1 xu = 1 đồng
    vouchers: [
      {
        code: { type: String, required: true },
        discount: { type: Number, required: true }, // Giảm giá (VNĐ hoặc %)
        expiryDate: { type: Date }, // Ngày hết hạn
        used: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserAssets", userAssetsSchema);
