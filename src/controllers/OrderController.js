const Status = require("../models/StatusModel");
const OrderService = require("../services/OrderService");
const UserAssetsService = require("../services/UserAssetsService");

// Tạo đơn hàng mới
// const createOrder = async (req, res) => {
//   try {
//     const { orderItems, shippingAddress, paymentMethod, user } = req.body;

//     // Kiểm tra input
//     if (!orderItems || !shippingAddress || !paymentMethod || !user) {
//       return res.status(200).json({
//         status: "ERR",
//         message: "The input is required",
//       });
//     }

//     const response = await OrderService.createOrder(req.body);
//     return res.status(200).json(response);
//   } catch (e) {
//     return res.status(404).json({
//       message: e.message || "Something went wrong",
//     });
//   }
// };

// const createOrder = async (req, res) => {
//   try {
//     const {
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       shippingPrice = 30000, // Giá trị mặc định nếu không được truyền
//       userId,
//       deliveryDate,
//       deliveryTime,
//       orderNote = "", // Ghi chú mặc định
//     } = req.body;

//     // Tính toán các giá trị tổng
//     const totalItemPrice = orderItems.reduce(
//       (sum, item) => sum + item.total,
//       0
//     ); // Tổng tiền hàng
//     const totalPrice = totalItemPrice + shippingPrice; // Tổng thanh toán

//     // Kiểm tra dữ liệu
//     if (!orderItems || orderItems.length === 0) {
//       console.log("orderItems", orderItems);
//       return res.status(400).json({
//         status: "ERR",
//         message: "Order items cannot be empty",
//       });
//     }
//     if (!userId) {
//       // Người dùng chưa đăng nhập, kiểm tra thông tin giao hàng
//       if (
//         !shippingAddress ||
//         !shippingAddress.familyName ||
//         !shippingAddress.userName ||
//         !shippingAddress.userPhone ||
//         !shippingAddress.userEmail ||
//         !shippingAddress.userAddress
//       ) {
//         return res.status(400).json({
//           status: "ERR",
//           message: "Shipping information is required for guest orders.",
//         });
//       }
//     }

//     if (!paymentMethod) {
//       return res.status(400).json({
//         status: "ERR",
//         message: "Payment method is required",
//       });
//     }
//     // if (!user) {
//     //   return res.status(400).json({
//     //     status: "ERR",
//     //     message: "User is required",
//     //   });
//     // }

//     // Tạo đơn hàng
//     const newOrder = await Order.create({
//       orderCode: `ORD-${Date.now()}`, // Tạo mã đơn hàng duy nhất
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       userId: userId || null, // Nếu không có userId thì để null
//       shippingPrice,
//       totalItemPrice,
//       totalPrice,
//       deliveryDate,
//       deliveryTime,
//       status: "PENDING", // Trạng thái mặc định là đang chờ
//       orderNote, // Ghi chú đơn hàng nếu có
//     });

//     // Trả về phản hồi
//     res.status(201).json({
//       status: "OK",
//       message: "Order created successfully",
//       data: newOrder,
//     });
//   } catch (error) {
//     console.error("Error in createOrder:", error);
//     res.status(500).json({
//       status: "ERR",
//       message: error.message || "Internal server error",
//     });
//   }
// };

const createOrder = async (req, res) => {
  try {
    const response = await OrderService.createOrder(req.body);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

// Cập nhật thông tin đơn hàng
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.updateOrder(orderId, data);
    return res.status(200).json({
      status: "OK",
      message: "Order updated successfully",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.deleteOrder(orderId);
    return res.status(200).json({
      status: "OK",
      message: "Order deleted successfully",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Lấy thông tin chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "Order ID is required",
      });
    }

    const order = await OrderService.getOrderDetails(orderId);
    if (order.status === "ERR") {
      return res.status(404).json({
        status: "ERR",
        message: order.message,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Order details retrieved successfully",
      data: order.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Error retrieving order details",
    });
  }
};

// Lấy danh sách tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const response = await OrderService.getAllOrders();

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error in getAllOrders:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("QWE", userId);
    // Kiểm tra input
    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await OrderService.getOrdersByUser(userId);
    const orders = response.data;
    console.log("ORDERS", orders);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "No orders found for this user",
      });
    }
    console.log("STATUS", response.status);
    console.log("ORDERS", orders);
    return res.status(200).json({
      status: "OK",
      message: "User orders fetched successfully",
      data: orders,
    });
  } catch (e) {
    console.error("Error in getOrdersByUser:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { statusId } = req.body; // Lấy statusId từ body

    if (!statusId) {
      return res.status(400).json({
        status: "ERR",
        message: "Status ID is required",
      });
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      statusId
    );

    return res.status(200).json({
      status: "OK",
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (e) {
    console.error("Error in updateOrderStatus:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Trừ xu khi thanh toán đơn hàng
const deductCoinsForOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware auth
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Số xu không hợp lệ",
      });
    }

    // Trừ xu từ tài khoản user
    const updatedAssets = await UserAssetsService.deductCoins(userId, amount);

    res.json({
      status: "OK",
      message: `Đã trừ ${amount} xu thành công`,
      data: {
        remainingCoins: updatedAssets.coins,
        deductedAmount: amount,
      },
    });
  } catch (error) {
    console.error("Error in deductCoinsForOrder:", error);
    res.status(400).json({
      status: "ERR",
      message: error.message || "Lỗi server",
    });
  }
};

// Đổi xu thành tiền cho đơn hàng
const applyCoinsToOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware auth
    const { orderId, coinsToUse } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "Order ID là bắt buộc",
      });
    }

    if (coinsToUse === undefined || coinsToUse === null) {
      return res.status(400).json({
        status: "ERR",
        message: "Số xu muốn sử dụng là bắt buộc",
      });
    }

    const response = await OrderService.applyCoinsToOrder(
      orderId,
      userId,
      coinsToUse
    );

    res.json(response);
  } catch (error) {
    console.error("Error in applyCoinsToOrder:", error);
    res.status(400).json({
      status: "ERR",
      message: error.message || "Lỗi server",
    });
  }
};

// Lấy top 5 đơn hàng mới nhất
const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    if (limit <= 0 || limit > 20) {
      return res.status(400).json({
        status: "ERR",
        message: "Limit must be between 1 and 20",
      });
    }

    const response = await OrderService.getRecentOrders(limit);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

// Lấy top 10 sản phẩm bán chạy nhất
const getBestSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit <= 0 || limit > 50) {
      return res.status(400).json({
        status: "ERR",
        message: "Limit must be between 1 and 50",
      });
    }

    const response = await OrderService.getBestSellingProducts(limit);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getBestSellingProducts:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
  deductCoinsForOrder,
  applyCoinsToOrder,
  getRecentOrders,
  getBestSellingProducts,
};
