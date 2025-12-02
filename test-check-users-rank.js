/**
 * Script kiểm tra users có rank trong database
 * Chạy: node test-check-users-rank.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/UserModel");
const Rank = require("./src/models/RankModel");
const Order = require("./src/models/OrderModel");

async function checkUsersRank() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to MongoDB");

    // Lấy tất cả users
    const users = await User.find()
      .populate("currentRank")
      .select("userName userEmail currentRank totalSpending");

    console.log("\n📊 KIỂM TRA RANK CỦA USERS:");
    console.log("==========================================\n");

    for (const user of users) {
      // Đếm số orders
      const orderCount = await Order.countDocuments({ userId: user._id });

      console.log(`👤 User: ${user.userName} (${user.userEmail})`);
      console.log(
        `   💰 Total Spending: ${
          user.totalSpending?.toLocaleString("vi-VN") || 0
        } VNĐ`
      );
      console.log(`   📦 Orders: ${orderCount}`);

      if (user.currentRank) {
        console.log(
          `   🏅 Rank: ${user.currentRank.rankDisplayName} (${user.currentRank.rankCode})`
        );
        console.log(
          `   🎨 Color: ${user.currentRank.color}, Icon: ${user.currentRank.icon}`
        );
      } else {
        console.log(`   ❌ Chưa có rank (currentRank = null)`);
      }
      console.log("");
    }

    // Kiểm tra ranks trong hệ thống
    const ranks = await Rank.find().sort({ priority: 1 });
    console.log("\n🏆 RANKS TRONG HỆ THỐNG:");
    console.log("==========================================\n");

    ranks.forEach((rank) => {
      console.log(`${rank.icon} ${rank.rankDisplayName} (${rank.rankCode})`);
      console.log(
        `   Spending: ${rank.minSpending.toLocaleString("vi-VN")} - ${
          rank.maxSpending ? rank.maxSpending.toLocaleString("vi-VN") : "∞"
        } VNĐ`
      );
      console.log(`   Discount: ${rank.discountPercent}%`);
      console.log("");
    });

    await mongoose.connection.close();
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUsersRank();
