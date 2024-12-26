const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      required: true,
      unique: true, // Mã thanh toán duy nhất
    },
    paymentName: {
      type: String,
      required: true, // Tên giao dịch thanh toán
    },
    paymentMethod: {
      type: String,
      required: true, // Phương thức thanh toán (VD: bank_transfer, cash)
    },
    userBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank", // Liên kết với model Bank
      required: true,
    },
    userBankNumber: {
      type: String,
      required: true, // Số tài khoản người dùng
    },
    adminBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank", // Liên kết với model Bank
      required: true, // Tên ngân hàng của admin
    },
    adminBankNumber: {
      type: String,
      required: true, // Số tài khoản admin
    },
    adminBankImage: {
      type: String,
      required: true, // Hình ảnh (QR code hoặc logo) ngân hàng admin
    },
    orderCode: {
      type: mongoose.Schema.Types.String,
      ref: "Order", // Liên kết với đơn hàng
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Payment = mongoose.model("Payment", paymentSchema); // Đặt tên đúng cho model
module.exports = Payment;
