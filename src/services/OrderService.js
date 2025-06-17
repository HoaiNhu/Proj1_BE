const Order = require("../models/OrderModel");
const Status = require("../models/StatusModel");
const UserAssetsService = require("./UserAssetsService");
const mongoose = require("mongoose");

// Kiểm tra tồn tại đơn hàng
const checkOrderExistence = async (id) => {
  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }
  return existingOrder;
};

// Tạo đơn hàng mới
// const createOrder = (newOrder) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const createdOrder = await Order.create(newOrder);
//       if (createdOrder) {
//         resolve({
//           status: "OK",
//           message: "Order created successfully",
//           data: createdOrder,
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const createOrder = async (orderData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        shippingPrice = 30000,
        userId,
        deliveryDate,
        deliveryTime,
        orderNote = "",
        status = "PENDING",
      } = orderData;

      // Tính toán các giá trị tổng
      const totalItemPrice = orderItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const totalPrice = totalItemPrice + shippingPrice;

      // Kiểm tra dữ liệu
      if (!orderItems || orderItems.length === 0) {
        return reject({
          status: "ERR",
          message: "Order items cannot be empty",
        });
      }

      // Validate order items details
      orderItems.forEach((item) => {
        if (!item.product) {
          return reject({
            status: "ERR",
            message: "Product is required in order items",
          });
        }
        if (!item.total || isNaN(item.total)) {
          return reject({
            status: "ERR",
            message: "Total is required and must be a number in order items",
          });
        }
      });

      if (!userId) {
        // Trường hợp khách chưa đăng nhập
        if (
          !shippingAddress ||
          !shippingAddress.familyName ||
          !shippingAddress.userName ||
          !shippingAddress.userPhone ||
          !shippingAddress.userEmail ||
          !shippingAddress.userAddress
        ) {
          return reject({
            status: "ERR",
            message: "Shipping information is required for guest orders.",
          });
        }
      }

      if (!paymentMethod) {
        return reject({
          status: "ERR",
          message: "Payment method is required",
        });
      }

      // Lấy ObjectId của trạng thái
      const statusObj = await Status.findOne({ statusCode: status });
      if (!statusObj) {
        return reject({
          status: "ERR",
          message: `Status ${status} not found`,
        });
      }

      // Tạo đơn hàng
      const newOrder = await Order.create({
        orderCode: `ORD-${Date.now()}`,
        orderItems,
        shippingAddress,
        paymentMethod,
        userId: userId || null,
        shippingPrice,
        totalItemPrice,
        totalPrice,
        deliveryDate,
        deliveryTime,
        status: statusObj._id,
        orderNote,
      });

      // Gọi API FastAPI để cập nhật mô hình khuyến nghị
      try {
        await axios.post(`${process.env.FASTAPI_URL}/update-model`);
      } catch (error) {
        console.error("Lỗi khi cập nhật mô hình khuyến nghị:", error);
      }

      resolve({
        status: "OK",
        message: "Order created successfully",
        data: newOrder,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "An error occurred while creating the order",
      });
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
      // Kiểm tra id có hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return resolve({
          status: "ERR",
          message: "Invalid order ID format",
        });
      }

      const order = await Order.findById(id)
        .populate("orderItems.product")
        .populate("userId")
        // .populate("user")
        .populate("status");
      if (!order) {
        return resolve({
          status: "ERR",
          message: "Order not found",
        });
      }

      return resolve({
        status: "OK",
        message: "Order details retrieved successfully",
        data: order,
      });
    } catch (e) {
      console.error("Error in getOrderDetails:", e);
      return resolve({
        status: "ERR",
        message: e.message || "Error retrieving order details",
      });
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
const getAllOrders = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find()
        .populate("orderItems.product")
        .populate("userId")
        .populate("status");

      resolve({
        status: "OK",
        message: "Get all Orders is SUCCESS",
        data: orders,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve orders",
      });
    }
  });
};

// Lấy danh sách đơn hàng của người dùng
const getOrdersByUser = (userId) => {
  console.log("USERID", userId);
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
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
const updateOrderStatus = (id, statusId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra _id có hợp lệ không
      const status = await Status.findById(statusId);
      if (!status) {
        return reject(new Error("Invalid status ID"));
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: status._id },
        { new: true }
      );

      if (!updatedOrder) {
        return reject(new Error("Order not found"));
      }

      resolve(updatedOrder);
    } catch (e) {
      reject(e);
    }
  });
};

// Đổi xu thành tiền cho đơn hàng
const applyCoinsToOrder = async (orderId, userId, coinsToUse) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await checkOrderExistence(orderId);

      // Kiểm tra đơn hàng thuộc về user
      if (order.userId && order.userId.toString() !== userId.toString()) {
        return reject({
          status: "ERR",
          message: "Bạn không có quyền thay đổi đơn hàng này",
        });
      }

      // Kiểm tra số xu hợp lệ
      if (!coinsToUse || coinsToUse < 0) {
        return reject({
          status: "ERR",
          message: "Số xu phải lớn hơn hoặc bằng 0",
        });
      }

      // Kiểm tra số xu hiện có của user
      const userCoins = await UserAssetsService.checkCoins(userId);
      if (userCoins < coinsToUse) {
        return reject({
          status: "ERR",
          message: `Bạn chỉ có ${userCoins} xu, không đủ để sử dụng ${coinsToUse} xu`,
        });
      }

      // Kiểm tra số xu không vượt quá tổng tiền đơn hàng
      const maxCoinsCanUse = order.totalItemPrice + order.shippingPrice;
      if (coinsToUse > maxCoinsCanUse) {
        return reject({
          status: "ERR",
          message: `Số xu tối đa có thể sử dụng là ${maxCoinsCanUse} xu`,
        });
      }

      // Cập nhật đơn hàng với số xu mới
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          coinsUsed: coinsToUse,
          totalPrice: order.totalItemPrice + order.shippingPrice - coinsToUse,
        },
        { new: true }
      );

      // Trừ xu từ tài khoản user
      if (coinsToUse > 0) {
        await UserAssetsService.deductCoins(userId, coinsToUse);
      }

      resolve({
        status: "OK",
        message: `Đã áp dụng ${coinsToUse} xu cho đơn hàng`,
        data: {
          order: updatedOrder,
          coinsUsed: coinsToUse,
          remainingCoins: userCoins - coinsToUse,
          newTotalPrice: updatedOrder.totalPrice,
        },
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Có lỗi xảy ra khi áp dụng xu",
      });
    }
  });
};

// Lấy danh sách các khuyến mãi và gán giá trị khuyến mãi cho order

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
  applyCoinsToOrder,
};
