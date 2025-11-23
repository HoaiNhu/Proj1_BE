const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/VoucherController");
const {
  authMiddleware,
  authUserMiddleware,
  authUserTokenMiddleware,
} = require("../middleware/authMiddleware");
const uploadCloudinary = require("../Helper/UploadCloudinary");

// ========== ADMIN ROUTES ==========

// Tạo voucher mới
router.post(
  "/create",
  authMiddleware,
  uploadCloudinary.single("voucherImage"),
  voucherController.createVoucher
);

// Tạo voucher hàng loạt
router.post(
  "/create-bulk",
  authMiddleware,
  uploadCloudinary.single("voucherImage"),
  voucherController.createBulkVouchers
);

// Cập nhật voucher
router.put(
  "/update/:id",
  authMiddleware,
  uploadCloudinary.single("voucherImage"),
  voucherController.updateVoucher
);

// Xóa voucher
router.delete("/delete/:id", authMiddleware, voucherController.deleteVoucher);

// Toggle trạng thái voucher
router.patch(
  "/toggle-status/:id",
  authMiddleware,
  voucherController.toggleVoucherStatus
);

// Gửi voucher qua email
router.post("/send-email", authMiddleware, voucherController.sendVoucherEmail);

// Lấy thống kê voucher
router.get(
  "/statistics",
  authMiddleware,
  voucherController.getVoucherStatistics
);

// Lấy tất cả voucher (admin)
router.get("/admin/all", authMiddleware, voucherController.getAllVouchers);

// Lấy chi tiết voucher
router.get("/detail/:id", voucherController.getVoucherDetails);

// ========== USER ROUTES ==========

// Lấy danh sách voucher công khai
router.get("/public", voucherController.getPublicVouchers);

// User claim voucher
router.post("/claim", authUserTokenMiddleware, voucherController.claimVoucher);

// Lấy voucher của user
router.get(
  "/my-vouchers",
  authUserTokenMiddleware,
  voucherController.getUserVouchers
);

// Validate voucher code
router.post(
  "/validate",
  authUserTokenMiddleware,
  voucherController.validateVoucherCode
);

// Áp dụng vouchers vào order
router.post(
  "/apply",
  authUserTokenMiddleware,
  voucherController.applyVouchersToOrder
);

module.exports = router;
