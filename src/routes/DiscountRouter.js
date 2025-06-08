const express = require("express");
const router = express.Router();
const discountController = require("../controllers/DiscountController");
const { authMiddleware } = require("../middleware/authMiddleware");
const uploadCloudinary = require("../Helper/DiscountUploadCloudinary");

// === ROUTES CHÍNH ===

// Tạo khuyến mãi mới (yêu cầu đăng nhập, upload hình ảnh)
router.post(
  "/create-discount",
  authMiddleware,
  uploadCloudinary.single("discountImage"),
  discountController.createDiscount
);

// Cập nhật khuyến mãi
router.put(
  "/update-discount/:id",
  authMiddleware,
  uploadCloudinary.single("discountImage"),
  discountController.updateDiscount
);

// Xóa khuyến mãi
router.delete("/delete-discount/:id", authMiddleware, discountController.deleteDiscount);

// Lấy chi tiết 1 khuyến mãi
router.get("/get-details/:id", discountController.getDetailsDiscount);

// Lấy toàn bộ khuyến mãi (có phân trang, lọc, sắp xếp)
router.get("/get-all-discount", discountController.getAllDiscount);


// === CÁC ROUTES BỔ SUNG ===

// Kiểm tra mã giảm giá hợp lệ
router.post("/validate-discount", discountController.validateDiscount);


// Bật / tắt trạng thái khuyến mãi
router.patch("/toggle-status/:id", authMiddleware, discountController.toggleDiscountStatus);

module.exports = router;
