const express = require("express");
const router = express.Router();
const { authUserTokenMiddleware } = require("../middleware/authMiddleware");
const {
  getUserAssets,
  deductCoins,
  checkCoins,
  getAllUserAssets,
} = require("../controllers/UserAssetsController");

// Tất cả routes đều cần đăng nhập
router.use(authUserTokenMiddleware);

router.get("/", getUserAssets);
router.post("/deduct", deductCoins);
router.get("/coins", checkCoins);

// Debug route - chỉ dùng để kiểm tra
router.get("/debug/all", getAllUserAssets);

module.exports = router;
