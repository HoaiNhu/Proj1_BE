const express = require("express");
const router = express.Router();
const statusController = require("../controllers/StatusController");
const { authMiddleware, isAdminMiddleware } = require("../middleware/authMiddleware");

// Tạo trạng thái mới (chỉ Admin)
router.post("/create-status", authMiddleware, isAdminMiddleware, statusController.createStatus);

// Cập nhật trạng thái (chỉ Admin)
router.put("/update-status/:id", authMiddleware, isAdminMiddleware, statusController.updateStatus);

// Xóa trạng thái (chỉ Admin)
router.delete("/delete-status/:id", authMiddleware, isAdminMiddleware, statusController.deleteStatus);

// Lấy chi tiết trạng thái
router.get("/get-detail-status/:id", statusController.getDetailStatus);

// Lấy tất cả trạng thái (phân trang, lọc, sắp xếp)
router.get("/get-all-status", statusController.getAllStatus);

// Kiểm tra trạng thái cụ thể (cần đăng nhập)
router.get("/check-status/:id", authMiddleware, statusController.checkStatus);

module.exports = router;
