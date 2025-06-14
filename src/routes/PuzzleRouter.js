const express = require("express");
const router = express.Router();
const { authUserTokenMiddleware } = require("../middleware/authMiddleware");
const {
  getDailyPuzzle,
  submitAnswer,
  getProductInfo,
  getUserPuzzleProgress,
} = require("../controllers/PuzzleController");

// Route lấy ô chữ không cần đăng nhập (để hiển thị)
router.get("/", getDailyPuzzle);

// Routes cần đăng nhập
router.post("/submit", authUserTokenMiddleware, submitAnswer);
router.get("/product", getProductInfo);

// Lấy trạng thái chơi của user
router.get("/progress", authUserTokenMiddleware, getUserPuzzleProgress);

module.exports = router;
