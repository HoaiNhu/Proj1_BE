/**
 * Script khởi tạo 3 ranks mặc định cho hệ thống
 * Chạy: node scripts/init-ranks.js
 *
 * Yêu cầu:
 * - Backend server đang chạy (port 3001)
 * - Có access_token của admin để tạo ranks
 */

const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001/api";

// Cấu hình 3 ranks theo yêu cầu
const ranks = [
  {
    rankName: "Bronze",
    rankDisplayName: "Đồng",
    rankCode: "RANK_BRONZE",
    discountPercent: 0, // Không giảm giá
    minSpending: 0,
    maxSpending: 499999, // Dưới 500k
    priority: 1,
    color: "#CD7F32", // Màu đồng
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
    color: "#C0C0C0", // Màu bạc
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
    color: "#FFD700", // Màu vàng
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

/**
 * Hàm tạo rank
 */
async function createRank(rankData, token) {
  try {
    const response = await axios.post(`${API_URL}/rank/create`, rankData, {
      headers: {
        "Content-Type": "application/json",
        token: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Lỗi khi tạo rank");
    }
    throw error;
  }
}

/**
 * Kiểm tra xem rank đã tồn tại chưa
 */
async function getRanks() {
  try {
    const response = await axios.get(`${API_URL}/rank/all`);
    return response.data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ranks:", error.message);
    return [];
  }
}

/**
 * Main function
 */
async function initializeRanks() {
  console.log("🚀 Bắt đầu khởi tạo ranks...\n");

  // Lấy token từ biến môi trường hoặc yêu cầu nhập
  let token = process.env.ADMIN_TOKEN;

  if (!token) {
    console.log("⚠️  Chưa có ADMIN_TOKEN trong biến môi trường");
    console.log("📝 Cách lấy token:");
    console.log("   1. Đăng nhập vào website với tài khoản admin");
    console.log("   2. Mở Developer Tools (F12) > Application > Local Storage");
    console.log('   3. Copy giá trị của "access_token"');
    console.log(
      "   4. Chạy lại script với: ADMIN_TOKEN=your_token node scripts/init-ranks.js\n"
    );

    // Thử với token mẫu (nếu có)
    token = "YOUR_ADMIN_TOKEN_HERE";
  }

  try {
    // Kiểm tra ranks hiện có
    console.log("📋 Kiểm tra ranks hiện có...");
    const existingRanks = await getRanks();

    if (existingRanks.length > 0) {
      console.log(`✅ Đã có ${existingRanks.length} ranks trong hệ thống:`);
      existingRanks.forEach((rank) => {
        console.log(
          `   ${rank.icon} ${rank.rankDisplayName} (${rank.rankCode})`
        );
      });
      console.log("\n⚠️  Nếu muốn tạo lại, vui lòng xóa các ranks cũ trước.");
      return;
    }

    console.log("✅ Chưa có rank nào, bắt đầu tạo mới...\n");

    // Tạo từng rank
    let successCount = 0;
    let failedCount = 0;

    for (const rankData of ranks) {
      try {
        console.log(
          `🔄 Đang tạo rank: ${rankData.icon} ${rankData.rankDisplayName}...`
        );

        const result = await createRank(rankData, token);

        if (result.status === "OK") {
          successCount++;
          console.log(`   ✅ Tạo thành công!`);
          console.log(`      - Mã: ${rankData.rankCode}`);
          console.log(`      - Giảm giá: ${rankData.discountPercent}%`);
          console.log(
            `      - Chi tiêu: ${rankData.minSpending.toLocaleString(
              "vi-VN"
            )}đ - ${
              rankData.maxSpending
                ? rankData.maxSpending.toLocaleString("vi-VN") + "đ"
                : "Không giới hạn"
            }`
          );
        } else {
          failedCount++;
          console.log(`   ❌ Thất bại: ${result.message}`);
        }
      } catch (error) {
        failedCount++;
        console.log(`   ❌ Lỗi: ${error.message}`);
      }
      console.log("");
    }

    // Tổng kết
    console.log("📊 KẾT QUẢ:");
    console.log(`   ✅ Thành công: ${successCount}/${ranks.length}`);
    console.log(`   ❌ Thất bại: ${failedCount}/${ranks.length}`);

    if (successCount === ranks.length) {
      console.log("\n🎉 Hoàn tất! Tất cả ranks đã được tạo thành công!");
      console.log("\n📝 Kiểm tra tại: http://localhost:3000/admin/rank");
    }
  } catch (error) {
    console.error("\n❌ Lỗi khi khởi tạo ranks:", error.message);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  initializeRanks()
    .then(() => {
      console.log("\n✨ Script hoàn tất!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script thất bại:", error);
      process.exit(1);
    });
}

module.exports = { initializeRanks, ranks };
