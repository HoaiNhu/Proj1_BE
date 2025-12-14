const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true },
    paymentName: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    userBank: {
      type: String,
      required: function () {
        return (
          this.paymentMethod !== "paypal" && this.paymentMethod !== "sepay"
        );
      },
    },
    userBankNumber: {
      type: String,
      required: function () {
        return (
          this.paymentMethod !== "paypal" && this.paymentMethod !== "sepay"
        );
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
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
    },
    transId: { type: String, required: false },
    expiresAt: { type: Date, required: false }, // Thời gian hết hạn QR
    // Sepay specific fields
    sepayOrderId: { type: String, required: false }, // ID đơn hàng từ Sepay
    sepayTransactionId: { type: String, required: false }, // ID giao dịch từ Sepay
    sepayPaymentMethod: {
      type: String,
      required: false,
      enum: ["BANK_TRANSFER", "CARD", "NAPAS_BANK_TRANSFER"],
    }, // Phương thức thanh toán Sepay
    sepayData: { type: Object, required: false }, // Lưu toàn bộ response từ Sepay IPN
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
