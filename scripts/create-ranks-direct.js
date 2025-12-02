/**
 * Script tạo ranks trực tiếp vào database (không cần API)
 * Chạy: node scripts/create-ranks-direct.js
 *
 * ✅ Đơn giản nhất - không cần token, không cần API
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Rank = require("../src/models/RankModel");

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Đã kết nối MongoDB\n");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    process.exit(1);
  }
};

// Dữ liệu 3 ranks
const ranks = [
  {
    rankName: "Bronze",
    rankDisplayName: "Đồng",
    rankCode: "RANK_BRONZE",
    discountPercent: 0, // Không giảm giá
    minSpending: 0,
    maxSpending: 499999, // Dưới 500k
    priority: 1,
    color: "#CD7F32",
    icon: "🍪",
    benefits: [
      "Tích điểm thưởng cơ bản",
      "Nhận thông báo khuyến mãi",
      "Hỗ trợ khách hàng tiêu chuẩn",
    ],
    description: "Hạng thành viên mặc định cho tất cả khách hàng mới",
    isActive: true,
  },
  {
    rankName: "Silver",
    rankDisplayName: "Bạc",
    rankCode: "RANK_SILVER",
    discountPercent: 5, // Giảm 5%
    minSpending: 500000, // 500k
    maxSpending: 1499999, // Dưới 1.5 triệu
    priority: 2,
    color: "#C0C0C0",
    icon: "🍰",
    benefits: [
      "Giảm giá 5% cho mọi đơn hàng",
      "Tích điểm thưởng x1.5",
      "Ưu tiên hỗ trợ khách hàng",
      "Miễn phí vận chuyển cho đơn trên 200k",
    ],
    description:
      "Hạng thành viên bạc - Dành cho khách hàng có tổng chi tiêu từ 500.000đ",
    isActive: true,
  },
  {
    rankName: "Gold",
    rankDisplayName: "Vàng",
    rankCode: "RANK_GOLD",
    discountPercent: 10, // Giảm 10%
    minSpending: 1500000, // 1.5 triệu
    maxSpending: null, // Không giới hạn
    priority: 3,
    color: "#FFD700",
    icon: "🍫",
    benefits: [
      "Giảm giá 10% cho mọi đơn hàng",
      "Tích điểm thưởng x2",
      "Ưu tiên hỗ trợ VIP 24/7",
      "Miễn phí vận chuyển toàn bộ đơn hàng",
      "Voucher sinh nhật đặc biệt",
      "Được mời tham gia các sự kiện đặc biệt",
    ],
    description:
      "Hạng thành viên vàng - Dành cho khách hàng VIP có tổng chi tiêu từ 1.500.000đ",
    isActive: true,
  },
];

// Hàm tạo ranks
async function createRanks() {
  console.log("🎖️  KHỞI TẠO HỆ THỐNG RANKS");
  console.log("================================\n");

  await connectDB();

  try {
    // Kiểm tra ranks hiện có
    console.log("📋 Kiểm tra ranks hiện có...");
    const existingCount = await Rank.countDocuments();

    if (existingCount > 0) {
      console.log(`⚠️  Đã có ${existingCount} ranks trong database`);
      console.log("   Xóa tất cả ranks cũ trước...\n");
      await Rank.deleteMany({});
      console.log("✅ Đã xóa ranks cũ\n");
    }

    // Tạo ranks mới
    console.log("🚀 Đang tạo 3 ranks mới...\n");

    for (const rankData of ranks) {
      const rank = await Rank.create(rankData);
      console.log(`✅ ${rank.icon} ${rank.rankDisplayName} (${rank.rankCode})`);
      console.log(
        `   - Chi tiêu: ${rank.minSpending.toLocaleString("vi-VN")}đ - ${
          rank.maxSpending
            ? rank.maxSpending.toLocaleString("vi-VN") + "đ"
            : "Không giới hạn"
        }`
      );
      console.log(`   - Giảm giá: ${rank.discountPercent}%`);
      console.log(`   - Đặc quyền: ${rank.benefits.length} quyền lợi\n`);
    }

    console.log("📊 TỔNG KẾT:");
    console.log("================================");
    console.log("🍪 Bronze (Đồng)");
    console.log("   Chi tiêu: 0đ - 499.999đ");
    console.log("   Giảm giá: 0% (Mặc định)\n");

    console.log("🍰 Silver (Bạc)");
    console.log("   Chi tiêu: 500.000đ - 1.499.999đ");
    console.log("   Giảm giá: 5%\n");

    console.log("🍫 Gold (Vàng)");
    console.log("   Chi tiêu: 1.500.000đ+");
    console.log("   Giảm giá: 10% + Voucher sinh nhật\n");

    console.log(
      "🎉 Hoàn tất! Kiểm tra tại: http://localhost:3000/admin/rank\n"
    );
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    if (error.code === 11000) {
      console.log("💡 Ranks đã tồn tại. Chạy lại để xóa và tạo mới.\n");
    }
  } finally {
    await mongoose.connection.close();
    console.log("👋 Đã đóng kết nối MongoDB");
  }
}

// Chạy script
createRanks();
