const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");

// Existing payment routes
router.post("/create-payment", PaymentController.createPayment);
router.post("/create-qr-payment", PaymentController.createQrPayment);
router.get(
  "/get-detail-payment/:paymentCode",
  PaymentController.getDetailPayment
);

// ============ SEPAY ROUTES ============

// Tạo thanh toán Sepay
router.post("/sepay/create", PaymentController.createSepayPayment);

// Callback URLs từ Sepay (sau khi khách hàng thanh toán)
router.get("/sepay/success", PaymentController.handleSepayCallback);
router.get("/sepay/error", PaymentController.handleSepayCallback);
router.get("/sepay/cancel", PaymentController.handleSepayCallback);

// IPN Webhook từ Sepay (thông báo kết quả giao dịch)
router.post("/sepay/ipn", PaymentController.handleSepayIPN);

// Lấy chi tiết thanh toán Sepay
router.get(
  "/sepay/detail/:paymentCode",
  PaymentController.getSepayPaymentDetail
);

// Hủy đơn hàng Sepay
router.post("/sepay/cancel/:paymentCode", PaymentController.cancelSepayOrder);

module.exports = router;
