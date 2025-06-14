const UserAssets = require("../models/UserAssetsModel");

const UserAssetsService = {
  // Lấy thông tin xu của user
  getUserAssets: async (userId) => {
    try {
      let userAssets = await UserAssets.findOne({ userId });

      // Nếu chưa có, tạo mới với 0 xu
      if (!userAssets) {
        userAssets = await UserAssets.create({
          userId,
          coins: 0,
          vouchers: [],
        });
      }

      return userAssets;
    } catch (error) {
      throw error;
    }
  },

  // Cộng xu cho user
  addCoins: async (userId, amount) => {
    try {
      const userAssets = await UserAssets.findOneAndUpdate(
        { userId },
        { $inc: { coins: amount } },
        { new: true, upsert: true }
      );

      return userAssets;
    } catch (error) {
      throw error;
    }
  },

  // Trừ xu của user (khi thanh toán)
  deductCoins: async (userId, amount) => {
    try {
      const userAssets = await UserAssets.findOne({ userId });

      if (!userAssets || userAssets.coins < amount) {
        throw new Error("Không đủ xu để thực hiện giao dịch");
      }

      const updatedAssets = await UserAssets.findOneAndUpdate(
        { userId },
        { $inc: { coins: -amount } },
        { new: true }
      );

      return updatedAssets;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra số xu hiện tại
  checkCoins: async (userId) => {
    try {
      console.log("Checking coins for userId:", userId);
      let userAssets = await UserAssets.findOne({ userId });
      console.log("Found userAssets:", userAssets);

      // Nếu chưa có record, tạo mới với 0 xu
      if (!userAssets) {
        console.log("Creating new UserAssets record for user:", userId);
        userAssets = await UserAssets.create({
          userId,
          coins: 0,
          vouchers: [],
        });
        console.log("Created userAssets:", userAssets);
      }

      console.log("Returning coins:", userAssets.coins);
      return userAssets.coins;
    } catch (error) {
      console.error("Error in checkCoins:", error);
      throw error;
    }
  },
};

module.exports = UserAssetsService;
