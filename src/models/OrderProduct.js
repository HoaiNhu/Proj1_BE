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
        total: { type: Number, required: true }, // Tổng tiền cho sản phẩm
      },
    ],

    // Địa chỉ giao hàng
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: false }, // Địa chỉ chi tiết
      ward: { type: String, required: false }, // Xã/Phường
      district: { type: String, required: false }, // Quận/Huyện
      city: { type: String, required: false }, // Tỉnh/Thành phố
      phone: { type: String, required: true },
    },

    // Phương thức thanh toán
    paymentMethod: { type: String, required: true, default: "Online Payment" },

    // Người dùng đặt hàng
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Trạng thái đơn hàng
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },

    // Các giá trị thanh toán
    shippingPrice: { type: Number, required: true, default: 30000 }, // Phí vận chuyển cố định
    totalItemPrice: { type: Number, required: true }, // Tổng tiền hàng
    totalPrice: { type: Number, required: true }, // Tổng thanh toán (bao gồm vận chuyển)

    // Thời gian thanh toán và giao hàng
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
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
  // Tính tổng thanh toán
  order.totalPrice = order.totalItemPrice + order.shippingPrice;
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
