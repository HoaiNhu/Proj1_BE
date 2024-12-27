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
      required: false, // Tên giao dịch thanh toán
    },
    paymentMethod: {
      type: String,
      required: false, // Phương thức thanh toán (VD: bank_transfer, cash)
    },
    userBank: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Bank", // Liên kết với model Bank
      type: String,
      required: true,
    },
    userBankNumber: {
      type: String,
      required: true, // Số tài khoản người dùng
    },
    // adminBank: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Bank", // Liên kết với model Bank
    //   required: false, // Tên ngân hàng của admin
    // },
    // adminBankNumber: {
    //   type: String,
    //   required: false, // Số tài khoản admin
    // },
    // adminBankImage: {
    //   type: String,
    //   required: false, // Hình ảnh (QR code hoặc logo) ngân hàng admin
    // },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
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
