const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const axios = require('axios');

class ChatbotController {
  async processQuery(req, res) {
    try {
      const { query, userId } = req.body;

      if (!query) {
        return res.status(400).json({
          status: 'ERR',
          message: 'Vui lòng cung cấp nội dung truy vấn'
        });
      }

      const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSy...';
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      // 🔍 Lấy danh sách sản phẩm
      const products = await Product.find({}).lean();

      // 🧾 Tạo mô tả sản phẩm đẹp mắt
      const ProductDescriptions = products.map((p, index) => {
        return `🔸 ${p.productName}
  - Kích thước: ${p.productSize}
  - Giá: ${p.productPrice.toLocaleString()}đ
  - Thành phần: ${p.productDescriptions?.join(', ') || 'Không rõ'}
  - Phân loại: ${p.productType || 'Chưa rõ'}
`;
      }).join('\n');

      // 🧠 Prompt đầy đủ
      const prompt = `
Bạn là trợ lý AI thân thiện của tiệm bánh AVOCADO. Dưới đây là danh sách các sản phẩm hiện có:

${ProductDescriptions}

Nhiệm vụ của bạn:
1. Tư vấn sản phẩm phù hợp theo nhu cầu khách hàng (loại bánh, dịp sử dụng, giá cả)
2. Giải thích rõ thông tin như: thành phần, giá, kích thước, dịp phù hợp
3. Luôn trả lời ngắn gọn, lịch sự, bằng tiếng Việt
4. Nếu khách hỏi ngoài danh sách, hãy nói "Thông tin này hiện không có, bạn có thể truy cập website để biết thêm."
5. Một số từ viết tắt: 100k là 100.000đ, khi trả về phải trả về 100.000đ
Câu hỏi của khách hàng: "${query}"
`;

      const apiRequest = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      };

      const response = await axios.post(API_URL, apiRequest, {
        headers: { 'Content-Type': 'application/json' }
      });

      let responseText = '';
      if (
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        responseText = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Không tìm thấy nội dung phản hồi từ API');
      }

      return res.status(200).json({
        status: 'OK',
        message: responseText,
        data: null
      });

    } catch (error) {
      console.error('Error in chatbot processing:', error);
      return res.status(500).json({
        status: 'ERR',
        message: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.'
      });
    }
  }

  // Giữ nguyên phần getDetailsProduct nếu không có thay đổi
  async getDetailsProduct(req, res) {
    try {
      const { productId } = req.params;
      if (!productId) {
        return res.status(400).json({
          status: 'ERR',
          message: 'Vui lòng cung cấp ID sản phẩm'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: 'ERR',
          message: 'Không tìm thấy sản phẩm phù hợp'
        });
      }

      return res.status(200).json({
        status: 'OK',
        data: product
      });

    } catch (error) {
      console.error('Error getting product details:', error);
      return res.status(500).json({
        status: 'ERR',
        message: 'Xin lỗi, đã xảy ra lỗi khi lấy thông tin sản phẩm.'
      });
    }
  }
}

module.exports = new ChatbotController();
