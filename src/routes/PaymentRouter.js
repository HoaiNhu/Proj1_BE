const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/PaymentController");
const { authMiddleware, isAdminMiddleware } = require("../middleware/authMiddleware");

// Tạo mới Payment (chỉ Admin)
router.post("/create-payment", isAdminMiddleware, paymentController.createPayment);

// Cập nhật Payment (chỉ Admin)
router.put("/update-payment/:id", authMiddleware, isAdminMiddleware, paymentController.updatePayment);

// Xóa Payment (chỉ Admin)
router.delete("/delete-payment/:id", authMiddleware, isAdminMiddleware, paymentController.deletePayment);

// Lấy chi tiết Payment
router.get("/get-detail-payment/:id", authMiddleware, paymentController.getDetailsPayment);

// Lấy danh sách tất cả Payments (hỗ trợ phân trang, lọc, sắp xếp)
router.get("/get-all-payment", authMiddleware, paymentController.getAllPayment);

module.exports = router;
