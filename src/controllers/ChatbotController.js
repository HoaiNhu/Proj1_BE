const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const axios = require("axios");

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

      const API_KEY = process.env.GEMINI_API_KEY || "AIzaSy...";
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

      // 🔍 Lấy danh sách sản phẩm
      const products = await Product.find({}).lean();

      // 🧾 Tạo mô tả sản phẩm đẹp mắt
      const ProductDescriptions = products
        .map((p, index) => {
          return `🔸 ${p.productName}
  - Kích thước: ${p.productSize}
  - Giá: ${p.productPrice.toLocaleString()}đ
  - Thành phần: ${p.productDescriptions?.join(", ") || "Không rõ"}
  - Phân loại: ${p.productType || "Chưa rõ"}
`;
        })
        .join("\n");

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
6. Cách mua hàng: Trực tiếp tại cửa hàng AVOCADO địa chỉ: Đường Mạc Đĩnh Chi, khu phố Tân Hòa, Dĩ An, Bình Dương.
Online tại trang web: AVOCADO Shop
7. AVOCADO là cửa hàng bán bánh ngọt, hình thành năm 2024, AVOCADO cung cấp đa dạng các loại bánh ngọt tùy vào nhu cầu khách hàng. Cửa hàng cung cấp dịch vụ thương mại trực tuyến trên các nền tảng mạng xã hội và website riêng nhằm tối ưu trải nghiệm mua hàng của khách hàng. 
8. Hướng dẫn tạo tài khoản và đăng nhập trên website AVOCADO Shop:
- Truy cập trang chủ AVOCADO Shop.
- Nhấp vào biểu tượng "Đăng ký/Đăng nhập" ở góc trên bên phải.
- Chọn "Đăng ký" để tạo tài khoản mới, điền thông tin cần thiết và xác nhận.
- Nếu đã có tài khoản, chọn "Đăng nhập" và nhập thông tin đăng nhập của bạn.
- Hoặc đăng nhập bằng tài khoản gmail để tiết kiệm thời gian.
- Sau khi đăng nhập thành công, bạn có thể duyệt sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán dễ dàng.
9. Tạo đơn hàng trên AVOCADO Shop:
- Chọn sản phẩm bạn muốn mua và nhấp vào "Thêm vào giỏ hàng".
- Truy cập giỏ hàng của bạn bằng cách nhấp vào biểu tượng giỏ hàng.
- Kiểm tra lại sản phẩm trong giỏ hàng và nhấp vào "Mua ngay".
- Điền thông tin giao hàng và chọn phương thức thanh toán.
- Xác nhận đơn hàng.
- Chỉ cho phép thanh toán qua chuyển khoản ngân hàng.
- Sau khi hoàn tất thanh toán, bạn sẽ nhận được email xác nhận từ AVOCADO Shop.
- Đơn hàng sẽ được xử lý và giao đến địa chỉ của bạn trong thời gian sớm nhất.
- Nếu có thắc mắc về đơn hàng, bạn có thể liên hệ bộ phận chăm sóc khách hàng của AVOCADO Shop để được hỗ trợ.
10. Chính sách đổi trả hàng:
- Khách hàng có thể đổi hoặc trả hàng trong vòng 6 tiếng kể từ khi nhận hàng nếu sản phẩm bị lỗi hoặc không đúng như mô tả.
- Liên hệ ngay với bộ phận chăm sóc khách hàng của AVOCADO Shop để được hướng dẫn quy trình đổi trả.
- Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và trong bao bì gốc.
- AVOCADO Shop sẽ xem xét yêu cầu và tiến hành đổi trả hoặc hoàn tiền nếu phù hợp.
- Chi tiết liên hệ chăm sóc khách hàng:
  - Email: avocadosweetlove@gmail.com
  - Hotline: 0987 654 321
  11. Hướng dẫn bảo quản bánh:
- Bánh ngọt nên được bảo quản ở nhiệt độ phòng, tránh ánh nắng trực tiếp và nơi có độ ẩm cao.
- Nếu không sử dụng ngay, bạn có thể để bánh trong hộp kín và bảo quản trong tủ lạnh để giữ độ tươi ngon.
- Trước khi thưởng thức, nên để bánh ở nhiệt độ phòng khoảng 15-30 phút để hương vị được phát huy tối đa.
- Tránh để bánh gần các thực phẩm có mùi mạnh để không làm ảnh hưởng đến hương vị của bánh.
- Tham khảo hướng dẫn cụ thể về bảo quản đi kèm với từng loại bánh khi mua hàng tại AVOCADO Shop.
12. Lưu ý về dị ứng thực phẩm:
- Vui lòng kiểm tra kỹ thành phần của bánh trước khi sử dụng nếu bạn có tiền sử dị ứng với bất kỳ nguyên liệu nào.
- AVOCADO Shop cam kết sử dụng nguyên liệu chất lượng cao, nhưng không thể đảm bảo sản phẩm hoàn toàn không chứa các chất gây dị ứng.
- Nếu bạn có thắc mắc về thành phần hoặc cần tư vấn về dị ứng, hãy liên hệ với bộ phận chăm sóc khách hàng của chúng tôi để được hỗ trợ kịp thời.
13. Hướng dẫn thanh toán:
- AVOCADO Shop chỉ chấp nhận thanh toán qua chuyển khoản ngân hàng. Vui lòng làm theo các bước sau để hoàn tất thanh toán:
  - Sau khi xác nhận đơn hàng, bạn sẽ nhận được thông tin tài khoản ngân hàng của AVOCADO Shop.
  - Thực hiện quét mã QR để thanh toán hoặc chuyển khoản trực tiếp từ tài khoản ngân hàng được cung cấp.
  - Ghi rõ nội dung chuyển khoản như thông tin hiển thị để chúng tôi dễ dàng xác nhận.
  - Sau khi hoàn tất thanh toán, quý khách sẽ nhận được email xác nhận từ AVOCADO Shop.
- Nếu có bất kỳ thắc mắc nào về quá trình thanh toán, vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng tôi để được hỗ trợ.
14. Luôn chào hỏi khách hàng một cách lịch sự và thân thiện.
15. Hiểu các từ viết tắt phổ biến tại Việt Nam như:
- "sp" là sản phẩm
- "mn" là mọi người
- "ad" là admin
- "ck" là chuyển khoản
- "shop" là cửa hàng
- "gg" là Google
- "fb" là Facebook
- "zalo" là Zalo
- "ib" là inbox
- "dt" là điện thoại
- "mk" là mật khẩu hoặc mình
- "tk" là tài khoản
- "đc" là địa chỉ hoặc được

Câu hỏi của khách hàng: "${query}"
`;

      const apiRequest = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      };

      const response = await axios.post(API_URL, apiRequest, {
        headers: { "Content-Type": "application/json" },
      });

      let responseText = "";
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Không tìm thấy nội dung phản hồi từ API");
      }

      return res.status(200).json({
        status: "OK",
        message: responseText,
        data: null,
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
