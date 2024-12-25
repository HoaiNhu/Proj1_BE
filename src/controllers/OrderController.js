const OrderService = require("../services/OrderService");

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

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice = 30000, // Giá trị mặc định nếu không được truyền
      user,
      orderNote = "", // Ghi chú mặc định
    } = req.body;

    // Tính toán các giá trị tổng
    const totalItemPrice = orderItems.reduce(
      (sum, item) => sum + item.total,
      0
    ); // Tổng tiền hàng
    const totalPrice = totalItemPrice + shippingPrice; // Tổng thanh toán

    // Kiểm tra dữ liệu
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Order items cannot be empty",
      });
    }
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        status: "ERR",
        message: "Shipping address must include fullName and phone",
      });
    }
    if (!paymentMethod) {
      return res.status(400).json({
        status: "ERR",
        message: "Payment method is required",
      });
    }
    if (!user) {
      return res.status(400).json({
        status: "ERR",
        message: "User is required",
      });
    }

    // Tạo đơn hàng
    const newOrder = await Order.create({
      orderCode: `ORD-${Date.now()}`, // Tạo mã đơn hàng duy nhất
      orderItems,
      shippingAddress,
      paymentMethod,
      user,
      shippingPrice,
      totalItemPrice,
      totalPrice,
      status: "Pending", // Trạng thái mặc định là đang chờ
      orderNote, // Ghi chú đơn hàng nếu có
    });

    // Trả về phản hồi
    res.status(201).json({
      status: "OK",
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
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

    // Kiểm tra input
    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const order = await OrderService.getOrderDetails(orderId);
    if (!order) {
      return res.status(404).json({
        status: "ERR",
        message: "Order not found",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (e) {
    console.error("Error in getOrderDetails:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message || "Internal server error",
    });
  }
};

// Lấy danh sách tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const { limit = 10, page = 0, sort, filter } = req.query;

    const orders = await OrderService.getAllOrders(
      Number(limit),
      Number(page),
      sort,
      filter
    );

    return res.status(200).json({
      status: "OK",
      message: "All orders fetched successfully",
      data: orders,
    });
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

    // Kiểm tra input
    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const orders = await OrderService.getOrdersByUser(userId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "No orders found for this user",
      });
    }

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
    const { isPaid, isDelivered } = req.body;

    // Kiểm tra input
    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    if (isPaid === undefined && isDelivered === undefined) {
      return res.status(400).json({
        status: "ERR",
        message: "At least one status (isPaid or isDelivered) is required",
      });
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, {
      isPaid,
      isDelivered,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        status: "ERR",
        message: "Order not found",
      });
    }

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

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
};
