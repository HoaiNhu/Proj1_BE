const express = require("express");
const router = express.Router();
const RankController = require("../controllers/RankController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");

// Admin routes - Quản lý ranks (sử dụng authMiddleware thay vì authAdminMiddleware)
router.post("/create", authMiddleware, RankController.createRank);
router.get("/all", RankController.getAllRanks); // Public - để hiển thị cho users
router.get("/statistics", authMiddleware, RankController.getRankStatistics); // Thống kê ranks
router.get("/details/:id", authMiddleware, RankController.getRankById);
router.put("/update/:id", authMiddleware, RankController.updateRank);
router.delete("/delete/:id", authMiddleware, RankController.deleteRank);

// User routes - Xem rank của bản thân
router.get("/user/:id", authUserMiddleware, RankController.getUserRank);
router.get(
  "/user/:id/history",
  authUserMiddleware,
  RankController.getUserRankHistory
);

// Initialize default ranks (chỉ dùng 1 lần)
router.post(
  "/initialize",
  authMiddleware,
  RankController.initializeDefaultRanks
);

module.exports = router;
