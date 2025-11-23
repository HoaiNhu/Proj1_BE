const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const {
  authMiddleware,
  authUserTokenMiddleware,
} = require("../middleware/authMiddleware");

// Tạo đơn hàng mới
router.post("/create-order", orderController.createOrder);

// Cập nhật thông tin đơn hàng
router.put("/update-order/:id", orderController.updateOrder);

// Xóa đơn hàng
router.delete("/delete-order/:id", orderController.deleteOrder);

// Lấy thông tin chi tiết đơn hàng
router.get("/get-detail-order/:id", orderController.getOrderDetails);

// Lấy danh sách tất cả đơn hàng
router.get("/get-all-orders", authMiddleware, orderController.getAllOrders);

// Lấy danh sách đơn hàng của người dùng
router.get("/get-orders-by-user/:userId", orderController.getOrdersByUser);

// Cập nhật trạng thái thanh toán hoặc giao hàng
router.put(
  "/update-order-status/:id",
  authMiddleware,
  orderController.updateOrderStatus
);

// Trừ xu khi thanh toán đơn hàng
router.post(
  "/deduct-coins",
  authUserTokenMiddleware,
  orderController.deductCoinsForOrder
);

// Đổi xu thành tiền cho đơn hàng
router.post(
  "/apply-coins",
  authUserTokenMiddleware,
  orderController.applyCoinsToOrder
);

// Xác nhận thanh toán với voucher
router.post(
  "/confirm-payment-voucher",
  authUserTokenMiddleware,
  orderController.confirmPaymentWithVoucher
);

// Lấy top 5 đơn hàng mới nhất
router.get("/recent-orders", authMiddleware, orderController.getRecentOrders);

// Lấy top 10 sản phẩm bán chạy nhất
router.get(
  "/best-selling-products",
  authMiddleware,
  orderController.getBestSellingProducts
);

// Lấy đơn hàng mới trong tuần hiện tại
router.get(
  "/weekly-new-orders",
  authMiddleware,
  orderController.getWeeklyNewOrders
);

// Lấy đơn hàng mới của tuần trước
router.get(
  "/previous-week-new-orders",
  authMiddleware,
  orderController.getPreviousWeekNewOrders
);

module.exports = router;
