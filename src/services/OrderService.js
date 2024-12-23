const Order = require("../models/OrderModel");

// Kiểm tra tồn tại đơn hàng
const checkOrderExistence = async (id) => {
  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }
  return existingOrder;
};

// Tạo đơn hàng mới
const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      const createdOrder = await Order.create(newOrder);
      if (createdOrder) {
        resolve({
          status: "OK",
          message: "Order created successfully",
          data: createdOrder,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Cập nhật thông tin đơn hàng
const updateOrder = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkOrderExistence(id); // Kiểm tra tồn tại

      const updatedOrder = await Order.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: "OK",
        message: "Order updated successfully",
        data: updatedOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Xóa đơn hàng
const deleteOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkOrderExistence(id); // Kiểm tra tồn tại

      await Order.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Order deleted successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy thông tin chi tiết đơn hàng
const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id)
        .populate("orderItems.product")
        .populate("user")
        .populate("status");
      if (!order) {
        resolve({
          status: "ERR",
          message: "Order not found",
        });
      }

      resolve({
        status: "OK",
        message: "Order details retrieved successfully",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy danh sách tất cả đơn hàng
// const getAllOrders = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const orders = await Order.find()
//         .populate("orderItems.product")
//         .populate("user")
//         .populate("status");
//       resolve({
//         status: "OK",
//         message: "All orders retrieved successfully",
//         data: orders,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

// Lấy danh sách tất cả đơn hàng (có phân trang và sắp xếp)
const getAllOrders = async (
  limit = 10,
  page = 0,
  sort = "-createdAt",
  filter = {}
) => {
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(page * limit)
    .limit(limit)
    .populate("orderItems.product")
    .populate("user")
    .populate("status");
  const totalOrders = await Order.countDocuments(filter);
  return {
    status: "OK",
    message: "All orders retrieved successfully",
    data: orders,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
  };
};

// Lấy danh sách đơn hàng của người dùng
const getOrdersByUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find({ user: userId })
        .populate("orderItems.product")
        .populate("status");
      resolve({
        status: "OK",
        message: "Orders by user retrieved successfully",
        data: orders,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = (id, statusData) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkOrderExistence(id); // Kiểm tra tồn tại
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: statusData },
        { new: true }
      );
      resolve({
        status: "OK",
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
};
