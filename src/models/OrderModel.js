const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng duy nhất
    orderCode: { type: String, required: true, unique: true },

    // Danh sách sản phẩm trong đơn hàng
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true }, // Số lượng
        total: { type: Number, required: false }, // Tổng tiền cho sản phẩm
        discountPercent: { type: Number, default: 0 }, //Gia tri discount
      },
    ],

    // Địa chỉ giao hàng
    shippingAddress: {
      familyName: { type: String, required: true },
      userName: { type: String, required: true },
      userAddress: { type: String, required: false }, // Địa chỉ chi tiết
      userWard: { type: String, required: false }, // Xã/Phường
      userDistrict: { type: String, required: false }, // Quận/Huyện
      userCity: { type: String, required: false }, // Tỉnh/Thành phố
      userPhone: { type: String, required: true },
      userEmail: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: "Invalid email format.",
        },
      },
    },

    // Phương thức thanh toán
    paymentMethod: { type: String, required: true, default: "Online Payment" },

    // Người dùng đặt hàng
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    // Trạng thái đơn hàng
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "SUCCESS", "FAILED"],
    },
    // Các giá trị thanh toán
    shippingPrice: { type: Number, required: true, default: 30000 }, // Phí vận chuyển cố định
    totalItemPrice: { type: Number, required: true }, // Tổng tiền hàng
    totalPrice: { type: Number, required: true }, // Tổng thanh toán (bao gồm vận chuyển)
    coinsUsed: { type: Number, default: 0 }, // Số xu đã sử dụng cho đơn hàng này

    // Rank discount information
    rankDiscount: { type: Number, default: 0 }, // Giảm giá từ rank
    rankDiscountPercent: { type: Number, default: 0 }, // Phần trăm giảm giá từ rank

    // Voucher information
    vouchersUsed: [
      {
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
        voucherCode: { type: String },
        voucherName: { type: String },
        voucherType: { type: String },
        discountAmount: { type: Number },
      },
    ],
    voucherDiscount: { type: Number, default: 0 }, // Tổng giảm giá từ voucher

    // Thời gian thanh toán và giao hàng
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    deliveryDate: { type: Date, required: false }, // Ngày giao hàng
    deliveryTime: { type: String, required: false }, // Giờ giao hàng (hh:mm format)
    orderNote: { type: String, required: false }, // Ghi chú đơn hàng
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Middleware để tính tổng tiền hàng và tổng thanh toán
orderSchema.pre("save", function (next) {
  const order = this;
  // Tính tổng tiền hàng
  order.totalItemPrice = order.orderItems.reduce(
    (total, item) => total + item.total,
    0
  );
  // Tính tổng thanh toán (trừ đi rank discount, số xu đã sử dụng và voucher discount)
  order.totalPrice =
    order.totalItemPrice +
    order.shippingPrice -
    (order.rankDiscount || 0) -
    (order.coinsUsed || 0) -
    (order.voucherDiscount || 0);
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
