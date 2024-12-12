const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Tạo đơn hàng mới
router.post("/create-order", authMiddleware, orderController.createOrder);

// Cập nhật thông tin đơn hàng
router.put("/update-order/:id", authMiddleware, orderController.updateOrder);

// Xóa đơn hàng
router.delete("/delete-order/:id", authMiddleware, orderController.deleteOrder);

// Lấy thông tin chi tiết đơn hàng
router.get("/get-detail-order/:id", orderController.getOrderDetails);

// Lấy danh sách tất cả đơn hàng
router.get("/get-all-orders", orderController.getAllOrders);

// Lấy danh sách đơn hàng của người dùng
router.get(
  "/get-orders-by-user/:userId",
  authMiddleware,
  orderController.getOrdersByUser
);

// Cập nhật trạng thái thanh toán hoặc giao hàng
router.patch(
  "/update-order-status/:id",
  authMiddleware,
  orderController.updateOrderStatus
);

module.exports = router;
