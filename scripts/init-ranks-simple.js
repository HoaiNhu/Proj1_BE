/**
 * Script đơn giản để khởi tạo 3 ranks mặc định
 * Chạy: node scripts/init-ranks-simple.js
 *
 * ⚠️ LƯU Ý:
 * - Backend server phải đang chạy (port 3001)
 * - Cần đăng nhập và lấy access_token từ localStorage
 * - Hoặc tạm thời bỏ authMiddleware ở route /initialize để test
 */

const axios = require("axios");
const readline = require("readline");

const API_URL = process.env.API_URL || "http://localhost:3001/api";

// Tạo interface để nhập từ terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function initRanks() {
  console.log("\n🎖️  KHỞI TẠO HỆ THỐNG RANKS");
  console.log("================================\n");

  try {
    // Kiểm tra server
    console.log("🔍 Kiểm tra server...");
    try {
      await axios.get(`${API_URL}/rank/all`);
      console.log("✅ Server đang chạy\n");
    } catch (error) {
      console.log("❌ Server chưa chạy hoặc không kết nối được!");
      console.log("   Vui lòng chạy: npm start\n");
      process.exit(1);
    }

    // Kiểm tra ranks hiện có
    console.log("📋 Kiểm tra ranks hiện có...");
    const checkResponse = await axios.get(`${API_URL}/rank/all`);
    const existingRanks = checkResponse.data?.data || [];

    if (existingRanks.length > 0) {
      console.log(`\n⚠️  Đã có ${existingRanks.length} ranks trong hệ thống:`);
      existingRanks.forEach((rank) => {
        console.log(
          `   ${rank.icon} ${rank.rankDisplayName} - Giảm ${rank.discountPercent}%`
        );
      });

      const answer = await question(
        "\n❓ Bạn có muốn tiếp tục tạo thêm không? (y/n): "
      );
      if (answer.toLowerCase() !== "y") {
        console.log("🚫 Đã hủy");
        rl.close();
        return;
      }
    }

    console.log(
      "\n📝 Nhập access_token (lấy từ localStorage sau khi đăng nhập):"
    );
    console.log("   Hoặc nhấn Enter để thử không token (nếu đã tắt auth)\n");

    const token = await question("Token: ");

    console.log("\n🚀 Đang tạo ranks...\n");

    // Gọi API initialize
    const headers = token
      ? {
          "Content-Type": "application/json",
          token: `Bearer ${token.trim()}`,
        }
      : {
          "Content-Type": "application/json",
        };

    const response = await axios.post(
      `${API_URL}/rank/initialize`,
      {},
      { headers }
    );

    if (response.data.status === "OK") {
      console.log("✅ TẠO THÀNH CÔNG!\n");
      console.log("📊 Các ranks đã được tạo:");
      console.log(
        "   🍪 Bronze (Đồng)   - Chi tiêu: 0đ - 499.999đ       | Giảm: 0%"
      );
      console.log(
        "   🍰 Silver (Bạc)    - Chi tiêu: 500.000đ - 1.499.999đ | Giảm: 5%"
      );
      console.log(
        "   🍫 Gold (Vàng)     - Chi tiêu: 1.500.000đ+         | Giảm: 10%"
      );
      console.log(
        "\n🎉 Hoàn tất! Kiểm tra tại: http://localhost:3000/admin/rank\n"
      );
    } else {
      console.log("⚠️  Kết quả:", response.data.message);
    }
  } catch (error) {
    console.error("\n❌ LỖI:", error.response?.data?.message || error.message);

    if (error.response?.status === 401) {
      console.log("\n💡 GỢI Ý:");
      console.log(
        "   1. Đăng nhập vào http://localhost:3000/login với tài khoản admin"
      );
      console.log(
        "   2. Mở Developer Tools (F12) > Application > Local Storage"
      );
      console.log('   3. Copy giá trị "access_token"');
      console.log("   4. Chạy lại script và paste token\n");
      console.log(
        "   HOẶC: Tạm thời comment dòng authMiddleware trong RankRouter.js\n"
      );
    }
  } finally {
    rl.close();
  }
}

// Chạy
initRanks();
