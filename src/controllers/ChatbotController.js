const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const axios = require("axios");

// ✅ Cache cho products (refresh mỗi 5 phút)
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// ⚡ Rate limiting thông minh
const requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 5; // Giảm xuống 5 request/phút (rất thấp)
const RATE_LIMIT_WINDOW = 60000; // 1 phút
const USE_GEMINI_API = false; // ❌ TẠM TẮT GEMINI API (bật lại khi nâng cấp plan)

// 🤖 FAQ Database mở rộng - Câu trả lời có sẵn cho mọi tình huống
const FAQ_DATABASE = {
  // Thông tin cửa hàng
  "giới thiệu|về avocado|cửa hàng|tiệm bánh": {
    answer: `🏪 **AVOCADO Bakery Shop**

🎂 AVOCADO là tiệm bánh ngọt được thành lập năm 2024, chuyên cung cấp đa dạng các loại bánh ngọt cao cấp.

📍 **Địa chỉ:** Đường Mạc Đĩnh Chi, khu phố Tân Hòa, Dĩ An, Bình Dương

🛒 **Cách mua hàng:**
- Mua trực tiếp tại cửa hàng
- Đặt online qua website: AVOCADO Shop
- Giao hàng tận nơi trong khu vực Dĩ An, Bình Dương

💝 Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời!`,
    confidence: 0.9,
  },

  "địa chỉ|chỗ nào|ở đâu|đường nào": {
    answer: `📍 **Địa chỉ cửa hàng AVOCADO:**

Đường Mạc Đĩnh Chi, khu phố Tân Hòa, Dĩ An, Bình Dương

🕐 Giờ mở cửa: 8:00 - 21:00 (hàng ngày)
🚗 Có bãi đỗ xe rộng rãi
📞 Liên hệ đặt hàng trước để được phục vụ nhanh chóng!`,
    confidence: 0.95,
  },

  "giá|giá cả|bao nhiêu tiền|giá bán": {
    answer: async () => {
      const products = await Product.find({}).lean();
      const priceRanges = {
        cheap: products.filter((p) => p.productPrice < 50000),
        medium: products.filter(
          (p) => p.productPrice >= 50000 && p.productPrice < 200000
        ),
        expensive: products.filter((p) => p.productPrice >= 200000),
      };

      return `💰 **Bảng giá sản phẩm AVOCADO:**

🟢 **Phân khúc phổ thông** (dưới 50K): ${priceRanges.cheap.length} sản phẩm
   Ví dụ: Bánh Donut, Macaron, Tiramisu mini...

🟡 **Phân khúc trung cấp** (50K - 200K): ${priceRanges.medium.length} sản phẩm
   Ví dụ: Bánh bông lan, Cheesecake, Mousse...

🔴 **Phân khúc cao cấp** (từ 200K): ${priceRanges.expensive.length} sản phẩm
   Ví dụ: Bánh sinh nhật, Bánh kem trang trí đặc biệt...

💡 Bạn muốn xem sản phẩm nào cụ thể? Tôi sẽ tư vấn chi tiết!`;
    },
    confidence: 0.85,
  },

  "sinh nhật|bánh sinh nhật|birthday": {
    answer: async () => {
      const products = await Product.find({
        $or: [
          { productName: /sinh nhật|birthday|cake/i },
          { productType: /sinh nhật/i },
        ],
      })
        .limit(10)
        .lean();

      if (products.length === 0) {
        return `🎂 **Bánh sinh nhật tại AVOCADO:**

Chúng tôi có nhiều mẫu bánh sinh nhật đẹp mắt! Vui lòng liên hệ trực tiếp hoặc xem website để chọn mẫu phù hợp.

📞 Đặt bánh sinh nhật trước 24h để được phục vụ tốt nhất!`;
      }

      const list = products
        .map((p) => `🎂 ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");

      return `🎂 **Bánh sinh nhật tại AVOCADO:**\n\n${list}\n\n💡 Có thể tùy chỉnh theo yêu cầu! Liên hệ để được tư vấn chi tiết.`;
    },
    confidence: 0.9,
  },

  "giao hàng|ship|delivery|vận chuyển": {
    answer: `🚚 **Chính sách giao hàng:**

✅ Giao hàng miễn phí trong bán kính 5km (đơn từ 200K)
✅ Giao nhanh trong 1-2 tiếng (tùy khu vực)
✅ Đóng gói cẩn thận, đảm bảo bánh nguyên vẹn
✅ COD hoặc chuyển khoản đều được

📞 Gọi đặt hàng để được tư vấn thời gian giao hàng chính xác!`,
    confidence: 0.9,
  },

  "thanh toán|payment|trả tiền": {
    answer: `💳 **Phương thức thanh toán:**

✅ Tiền mặt (COD)
✅ Chuyển khoản ngân hàng
✅ Ví điện tử (Momo, ZaloPay)
✅ Quẹt thẻ tại cửa hàng

💡 Đặt bánh online vui lòng thanh toán trước 50% để giữ đơn!`,
    confidence: 0.9,
  },

  macaron: {
    answer: async () => {
      const products = await Product.find({ productName: /macaron/i }).lean();
      if (products.length === 0) {
        return "🍰 Hiện tại chúng tôi có Set 16 Bánh Macaron - 100,000đ với nhiều vị khác nhau!";
      }
      const list = products
        .map((p) => `🍰 ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");
      return `🍰 **Bánh Macaron tại AVOCADO:**\n\n${list}`;
    },
    confidence: 0.9,
  },

  tiramisu: {
    answer: async () => {
      const products = await Product.find({ productName: /tiramisu/i }).lean();
      if (products.length === 0) {
        return "☕ Tiramisu Little Carrot - 25,000đ - Vị cà phê đậm đà, ngọt ngào!";
      }
      const list = products
        .map((p) => `☕ ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");
      return `☕ **Bánh Tiramisu tại AVOCADO:**\n\n${list}`;
    },
    confidence: 0.9,
  },

  donut: {
    answer: async () => {
      const products = await Product.find({ productName: /donut/i }).lean();
      const list =
        products.length > 0
          ? products
              .map(
                (p) =>
                  `🍩 ${p.productName} - ${p.productPrice.toLocaleString()}đ`
              )
              .join("\n")
          : "🍩 Set 4 Bánh Donut Giáng Sinh - 50,000đ\n🍩 Set 2 Bánh Donut Bông Hoa - 30,000đ";
      return `🍩 **Bánh Donut tại AVOCADO:**\n\n${list}`;
    },
    confidence: 0.9,
  },

  "chocolate|socola|choco": {
    answer: async () => {
      const products = await Product.find({
        productName: /chocolate|socola|choco/i,
      })
        .limit(5)
        .lean();
      if (products.length === 0) {
        return "🍫 Chúng tôi có nhiều loại bánh chocolate! Vui lòng xem website để biết thêm chi tiết.";
      }
      const list = products
        .map((p) => `🍫 ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");
      return `🍫 **Bánh Chocolate tại AVOCADO:**\n\n${list}\n\n💡 Và còn nhiều loại khác nữa!`;
    },
    confidence: 0.85,
  },

  "dâu tây|dâu|strawberry": {
    answer: async () => {
      const products = await Product.find({ productName: /dâu/i })
        .limit(5)
        .lean();
      if (products.length === 0) {
        return "🍓 Bánh Dâu Tây Ngọt Ngào - 200,000đ - Tươi mát, thơm ngon!";
      }
      const list = products
        .map((p) => `🍓 ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");
      return `🍓 **Bánh Dâu Tây tại AVOCADO:**\n\n${list}`;
    },
    confidence: 0.9,
  },

  // 💡 Thêm các FAQ mở rộng
  "tư vấn|gợi ý|nên mua|giới thiệu bánh|bánh nào ngon": {
    answer: async () => {
      const products = await Product.find({})
        .sort({ productSold: -1 })
        .limit(5)
        .lean();
      const list = products
        .map((p) => `⭐ ${p.productName} - ${p.productPrice.toLocaleString()}đ`)
        .join("\n");
      return `⭐ **Top 5 bánh bán chạy nhất:**\n\n${list}\n\n💡 Bạn có thể chọn theo dịp: sinh nhật, tiệc, quà tặng hoặc tự thưởng!`;
    },
    confidence: 0.8,
  },

  "trẻ em|bé|con|baby|kid": {
    answer: `🧒 **Bánh phù hợp cho trẻ em:**

✅ Bánh Donut nhiều màu sắc
✅ Cupcake hình thú
✅ Bánh kem hình kì lân, công chúa
✅ Bánh Macaron nhỏ xinh

💡 Chúng tôi có thể tùy chỉnh hình dáng theo yêu thích của bé!
📞 Liên hệ: 0987 654 321`,
    confidence: 0.85,
  },

  "người lớn|người già|ông bà|ba mẹ": {
    answer: `👨‍👩‍👧 **Bánh phù hợp cho người lớn:**

✅ Tiramisu (vị cà phê nhẹ nhàng)
✅ Bánh Mousse (ít ngọt, thanh nhẹ)
✅ Bánh trái cây tươi (healthy)
✅ Bánh Cheesecake (vị béo nhẹ)

💡 Bánh không quá ngọt, phù hợp cho người lớn tuổi!`,
    confidence: 0.85,
  },

  "dịp|sự kiện|party|tiệc|event": {
    answer: `🎉 **Bánh cho các dịp đặc biệt:**

🎂 Sinh nhật: Bánh kem tầng, Cupcake set
🎄 Giáng sinh: Bánh hình cây thông, Gingerbread
💝 Valentine: Bánh hình trái tim, Red Velvet
🎊 Tết: Bánh truyền thống, Bánh hoa
👔 Sự kiện công ty: Tiramisu, Macaron set

📞 Đặt bánh trước 24h để được tư vấn & thiết kế riêng!`,
    confidence: 0.9,
  },

  "quà tặng|gift|tặng": {
    answer: `🎁 **Gợi ý bánh làm quà:**

✨ Set 16 Bánh Macaron - 100,000đ (sang trọng)
✨ Hộp Tiramisu mini - 60,000đ (tiện lợi)
✨ Set Chocolate cao cấp - 150,000đ (ngọt ngào)
✨ Bánh Mousse hộp đẹp - 120,000đ (đẳng cấp)

💝 Đóng gói sang trọng, kèm thiệp miễn phí!`,
    confidence: 0.9,
  },

  "giảm cân|ăn kiêng|diet|healthy|ít ngọt": {
    answer: `🥗 **Bánh ít ngọt, phù hợp ăn kiêng:**

🌿 Bánh trái cây tươi (ít đường)
🌿 Bánh Mousse (nhẹ, ít béo)
🌿 Bánh bông lan trứng muối (ít kem)
🌿 Tiramisu (ít đường, cà phê)

⚠️ Lưu ý: Vẫn chứa calo, nên ăn vừa phải!`,
    confidence: 0.85,
  },

  "đặt bánh|order|đặt hàng|mua|làm bánh": {
    answer: `📝 **Cách đặt bánh tại AVOCADO:**

1️⃣ **Online:** Truy cập website AVOCADO Shop
   - Chọn sản phẩm → Thêm giỏ hàng → Thanh toán
   
2️⃣ **Trực tiếp:** Đến cửa hàng
   - Địa chỉ: Đường Mạc Đĩnh Chi, Tân Hòa, Dĩ An, Bình Dương

3️⃣ **Hotline:** 0987 654 321

⏰ Đặt trước 24h cho bánh sinh nhật hoặc tùy chỉnh đặc biệt!`,
    confidence: 0.95,
  },

  "tài khoản|đăng ký|đăng nhập|account|login|sign": {
    answer: `👤 **Hướng dẫn đăng ký/đăng nhập:**

1️⃣ Truy cập website AVOCADO Shop
2️⃣ Click "Đăng ký/Đăng nhập" (góc trên phải)
3️⃣ Chọn:
   - Đăng ký mới (điền thông tin)
   - Đăng nhập Gmail (nhanh hơn)
   - Đăng nhập tài khoản có sẵn

✅ Sau đó có thể mua hàng, theo dõi đơn, lưu địa chỉ!`,
    confidence: 0.95,
  },

  "bảo quản|giữ|để|lưu trữ|store": {
    answer: `❄️ **Hướng dẫn bảo quản bánh:**

🌡️ **Nhiệt độ phòng** (20-25°C):
   - Bánh quy, Bánh bông lan: 2-3 ngày
   
🧊 **Tủ lạnh** (4-7°C):
   - Bánh kem, Mousse, Tiramisu: 1-2 ngày
   - Để ngăn mát, đậy kín
   
⏰ **Trước khi ăn:** Để ngoài 15-30 phút cho hương vị tốt nhất

⚠️ Tránh ánh nắng trực tiếp và nơi ẩm ướt!`,
    confidence: 0.95,
  },

  "đổi trả|hoàn tiền|refund|return|lỗi": {
    answer: `🔄 **Chính sách đổi trả:**

✅ Thời gian: Trong vòng 6 tiếng sau khi nhận hàng
✅ Điều kiện:
   - Sản phẩm lỗi hoặc không đúng mô tả
   - Còn nguyên vẹn, chưa sử dụng
   - Trong bao bì gốc

📞 Liên hệ ngay:
   - Email: avocadosweetlove@gmail.com
   - Hotline: 0987 654 321

💡 Chúng tôi sẽ đổi mới hoặc hoàn tiền 100%!`,
    confidence: 0.95,
  },

  "dị ứng|allergy|không ăn được|kiêng": {
    answer: `⚠️ **Lưu ý về dị ứng thực phẩm:**

🔍 Vui lòng kiểm tra thành phần trước khi mua:
   - Trứng, sữa, bột mì (phổ biến)
   - Hạt (hạnh nhân, óc chó...)
   - Đậu phộng
   - Gluten

📞 Liên hệ trước khi đặt: 0987 654 321

💡 Chúng tôi có thể tư vấn bánh phù hợp với tình trạng dị ứng của bạn!`,
    confidence: 0.9,
  },

  "xin chào|hello|hi|chào|hey": {
    answer: `👋 Xin chào! Tôi là trợ lý AI của AVOCADO Bakery 🎂

💡 Tôi có thể giúp bạn:
• Tư vấn sản phẩm phù hợp
• Thông tin giá cả, địa chỉ
• Hướng dẫn đặt hàng, thanh toán
• Chính sách giao hàng, đổi trả

❓ Bạn muốn hỏi gì? Cứ thoải mái nhé! 😊`,
    confidence: 0.95,
  },

  "cảm ơn|thank|thanks|cam on": {
    answer: `🙏 Rất vui được hỗ trợ bạn!

💝 Nếu cần thêm thông tin, đừng ngại hỏi nhé!
📞 Hotline: 0987 654 321

🎂 Chúc bạn có trải nghiệm mua sắm tuyệt vời tại AVOCADO! ✨`,
    confidence: 0.95,
  },
};

// 🔍 Hàm tìm kiếm FAQ
function findFAQMatch(query) {
  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
    .replace(/đ/g, "d");

  for (const [keywords, response] of Object.entries(FAQ_DATABASE)) {
    const keywordList = keywords.split("|");
    for (const keyword of keywordList) {
      if (normalizedQuery.includes(keyword)) {
        return response;
      }
    }
  }
  return null;
}

class ChatbotController {
  async processQuery(req, res) {
    try {
      const { query, userId } = req.body;

      if (!query) {
        return res.status(400).json({
          status: "ERR",
          message: "Vui lòng cung cấp nội dung truy vấn",
        });
      }

      // 🚀 BƯỚC 1: Kiểm tra FAQ có sẵn trước
      const faqMatch = findFAQMatch(query);

      if (faqMatch) {
        let answer = faqMatch.answer;

        // Nếu answer là function (cần query DB), thực thi nó
        if (typeof answer === "function") {
          answer = await answer();
        }

        return res.status(200).json({
          status: "OK",
          message: answer,
          data: { source: "faq", confidence: faqMatch.confidence },
        });
      }

      // 🚀 BƯỚC 2: Kiểm tra tên sản phẩm cụ thể
      let now = Date.now();
      if (!productsCache || now - cacheTimestamp > CACHE_DURATION) {
        productsCache = await Product.find({}).lean();
        cacheTimestamp = now;
      }

      const productMatch = productsCache.find((p) =>
        query.toLowerCase().includes(p.productName.toLowerCase())
      );

      if (productMatch) {
        return res.status(200).json({
          status: "OK",
          message:
            `🎂 **${productMatch.productName}**\n\n` +
            `💰 Giá: ${productMatch.productPrice.toLocaleString()}đ\n` +
            `📏 Kích thước: ${productMatch.productSize}cm\n` +
            `🏷️ Phân loại: ${productMatch.productType || "Bánh ngọt"}\n\n` +
            `💡 Bạn muốn đặt bánh này? Liên hệ ngay để được tư vấn!`,
          data: { source: "product_match", product: productMatch },
        });
      }

      // 🚀 BƯỚC 3: Nếu không match được FAQ/Product
      // ❌ TẠM THỜI KHÔNG GỌI GEMINI API (do bị rate limit 429)
      // ✅ Trả về gợi ý thông minh thay vì

      // Phân tích query để gợi ý chính xác hơn
      const queryLower = query.toLowerCase();
      let suggestion = "";

      if (queryLower.includes("bánh") || queryLower.includes("cake")) {
        suggestion =
          "💡 Bạn muốn tìm loại bánh nào? Ví dụ: Tiramisu, Macaron, Donut, Chocolate, Sinh nhật...";
      } else if (
        queryLower.includes("giá") ||
        queryLower.includes("price") ||
        queryLower.includes("bao nhiêu")
      ) {
        suggestion = "💡 Hỏi cụ thể: 'giá bánh tiramisu' hoặc 'bánh dưới 100k'";
      } else if (
        queryLower.includes("mua") ||
        queryLower.includes("order") ||
        queryLower.includes("đặt")
      ) {
        suggestion = "💡 Hỏi: 'cách đặt bánh' hoặc 'làm sao để mua'";
      } else {
        suggestion =
          "💡 Hãy hỏi rõ hơn về sản phẩm, giá cả, địa chỉ, giao hàng...";
      }

      return res.status(200).json({
        status: "OK",
        message:
          `🤖 Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.\n\n` +
          `${suggestion}\n\n` +
          `📋 **Tôi có thể trả lời:**\n` +
          `• Thông tin cửa hàng & địa chỉ\n` +
          `• Giá cả & sản phẩm cụ thể\n` +
          `• Tư vấn bánh theo dịp (sinh nhật, tiệc...)\n` +
          `• Hướng dẫn đặt hàng, thanh toán\n` +
          `• Giao hàng & đổi trả\n` +
          `• Bảo quản bánh\n\n` +
          `📞 Cần tư vấn ngay? Gọi: 0987 654 321`,
        data: { source: "smart_fallback", query_hint: suggestion },
      });
    } catch (error) {
      console.error("Error in chatbot processing:", error);
      return res.status(500).json({
        status: "ERR",
        message: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
      });
    }
  }

  // Giữ nguyên phần getDetailsProduct nếu không có thay đổi
  async getDetailsProduct(req, res) {
    try {
      const { productId } = req.params;
      if (!productId) {
        return res.status(400).json({
          status: "ERR",
          message: "Vui lòng cung cấp ID sản phẩm",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy sản phẩm phù hợp",
        });
      }

      return res.status(200).json({
        status: "OK",
        data: product,
      });
    } catch (error) {
      console.error("Error getting product details:", error);
      return res.status(500).json({
        status: "ERR",
        message: "Xin lỗi, đã xảy ra lỗi khi lấy thông tin sản phẩm.",
      });
    }
  }
}

module.exports = new ChatbotController();
