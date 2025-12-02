/**
 * Script tự động gán rank cho tất cả users dựa vào totalSpending
 * Chạy: node assign-ranks-to-all-users.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/UserModel");
const Rank = require("./src/models/RankModel");

async function assignRanksToAllUsers() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to MongoDB");

    // Lấy tất cả users
    const users = await User.find();
    console.log(`\n📊 Found ${users.length} users\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Tìm rank phù hợp với totalSpending
      const appropriateRank = await Rank.findRankBySpending(
        user.totalSpending || 0
      );

      if (appropriateRank) {
        // Cập nhật rank cho user
        user.currentRank = appropriateRank._id;
        await user.save();

        console.log(
          `✅ Updated ${user.userName}: Spending ${
            user.totalSpending?.toLocaleString("vi-VN") || 0
          } VNĐ → ${appropriateRank.rankDisplayName}`
        );
        updated++;
      } else {
        console.log(
          `⚠️  No rank found for ${user.userName} (Spending: ${
            user.totalSpending || 0
          })`
        );
        skipped++;
      }
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`   ✅ Updated: ${updated} users`);
    console.log(`   ⚠️  Skipped: ${skipped} users`);

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

assignRanksToAllUsers();
