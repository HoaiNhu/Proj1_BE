const express = require("express");
const router = express.Router();
const AIController = require("../controllers/AIController");
const { authUserTokenMiddleware } = require("../middleware/authMiddleware");
// const { verifyToken } = require("../middleware/auth");

// Tạo ảnh từ sketch
router.post(
  "/generate-cake",
  authUserTokenMiddleware,
  AIController.generateCake
);

// Lấy lịch sử tạo ảnh
router.get(
  "/history",
  authUserTokenMiddleware,
  AIController.getGenerationHistory
);

module.exports = router;
