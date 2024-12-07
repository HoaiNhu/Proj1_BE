const OrderService = require("../services/OrderService");

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, user } = req.body;

    // Kiểm tra input
    if (!orderItems || !shippingAddress || !paymentMethod || !user) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    const response = await OrderService.createOrder(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Cập nhật thông tin đơn hàng
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = req.body;

    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.updateOrder(orderId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.deleteOrder(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy thông tin chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.getOrderDetails(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy danh sách tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;

    const response = await OrderService.getAllOrders(
      Number(limit) || 10,
      Number(page) || 0,
      sort,
      filter
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await OrderService.getOrdersByUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { isPaid, isDelivered } = req.body;

    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }

    const response = await OrderService.updateOrderStatus(orderId, {
      isPaid,
      isDelivered,
    });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "Something went wrong",
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
