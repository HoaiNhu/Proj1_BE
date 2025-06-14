const UserAssetsService = require("../services/UserAssetsService");

// Lấy thông tin xu của user
const getUserAssets = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware auth
    const userAssets = await UserAssetsService.getUserAssets(userId);

    res.json({
      status: "OK",
      data: {
        coins: userAssets.coins,
        vouchers: userAssets.vouchers,
      },
    });
  } catch (error) {
    console.error("Error in getUserAssets:", error);
    res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};

// Trừ xu khi thanh toán
const deductCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Số xu không hợp lệ",
      });
    }

    const updatedAssets = await UserAssetsService.deductCoins(userId, amount);

    res.json({
      status: "OK",
      data: {
        remainingCoins: updatedAssets.coins,
        deductedAmount: amount,
      },
      message: `Đã trừ ${amount} xu thành công`,
    });
  } catch (error) {
    console.error("Error in deductCoins:", error);
    res.status(400).json({
      status: "ERR",
      message: error.message || "Lỗi server",
    });
  }
};

// Kiểm tra số xu hiện tại
const checkCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Checking coins for user:", userId);
    const coins = await UserAssetsService.checkCoins(userId);
    console.log("User coins from service:", coins);

    res.json({
      status: "OK",
      data: {
        coins: coins,
      },
    });
  } catch (error) {
    console.error("Error in checkCoins:", error);
    res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};

// Debug: Lấy tất cả UserAssets
const getAllUserAssets = async (req, res) => {
  try {
    const UserAssets = require("../models/UserAssetsModel");
    const allAssets = await UserAssets.find().populate(
      "userId",
      "userName userEmail"
    );
    console.log("All UserAssets:", allAssets);

    res.json({
      status: "OK",
      data: allAssets,
    });
  } catch (error) {
    console.error("Error in getAllUserAssets:", error);
    res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getUserAssets,
  deductCoins,
  checkCoins,
  getAllUserAssets,
};
