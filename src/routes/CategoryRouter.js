const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/CategoryController");
const { authMiddleware, isAdminMiddleware } = require("../middleware/authMiddleware");

// Tạo danh mục mới (chỉ Admin)
router.post("/create-category", authMiddleware, isAdminMiddleware, categoryController.createCategory);

// Cập nhật danh mục (chỉ Admin)
router.put("/update-category/:id", authMiddleware, isAdminMiddleware, categoryController.updateCategory);

// Xóa danh mục (chỉ Admin)
router.delete("/delete-category/:id", authMiddleware, isAdminMiddleware, categoryController.deleteCategory);

// Lấy chi tiết danh mục
router.get("/get-detail-category/:id", categoryController.getDetailsCategory);

// Lấy tất cả danh mục (hỗ trợ phân trang, lọc, sắp xếp)
router.get("/get-all-category", categoryController.getAllCategory);

module.exports = router;
