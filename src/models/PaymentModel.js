const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true },
    paymentName: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    userBank: {
      type: String,
      required: function () {
        return this.paymentMethod !== "paypal";
      },
    },
    userBankNumber: {
      type: String,
      required: function () {
        return this.paymentMethod !== "paypal";
      },
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentUrl: { type: String, required: false },
    qrCodeUrl: { type: String, required: false },
    status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "SUCCESS", "FAILED"],
    },
    transId: { type: String, required: false },
    expiresAt: { type: Date, required: false }, // Thời gian hết hạn QR
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
