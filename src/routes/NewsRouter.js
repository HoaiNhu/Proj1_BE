const express = require("express");
const router = express.Router();
const newsController = require("../controllers/NewsController");
const { authMiddleware, isAdminMiddleware } = require("../middleware/authMiddleware");

// Tạo bài viết (chỉ Admin)
router.post("/create-news", authMiddleware, isAdminMiddleware, newsController.createNews);

// Cập nhật bài viết (chỉ Admin)
router.put("/update-news/:id", authMiddleware, isAdminMiddleware, newsController.updateNews);

// Xóa bài viết (chỉ Admin)
router.delete("/delete-news/:id", authMiddleware, isAdminMiddleware, newsController.deleteNews);

// Lấy chi tiết bài viết
router.get("/get-detail-news/:id", newsController.getDetailsNews);

// Lấy tất cả bài viết (có hỗ trợ phân trang, lọc, sắp xếp)
router.get("/get-all-news", newsController.getAllNews);

// Thay đổi trạng thái bài viết (chỉ Admin)
router.patch(
  "/update-status-news/:id",
  authMiddleware,
  isAdminMiddleware,
  newsController.updateStatusNews
);

router.get("/check-status-news/:id", authMiddleware, newsController.checkNewsStatus);


module.exports = router;
