const AIService = require("../services/AIService");

class AIController {
  static async generateCake(req, res) {
    try {
      console.log("[AIController] Nhận request generate-cake");
      console.log("[AIController] Headers:", req.headers);
      console.log("[AIController] User:", req.user);

      const { sketch } = req.body;
      const userId = req.user.id;

      if (!sketch) {
        console.log("[AIController] Không có sketch trong request body");
        return res.status(400).json({
          success: false,
          error: "Vui lòng cung cấp ảnh phác thảo",
        });
      }

      console.log("[AIController] Kích thước sketch:", sketch.length);
      console.log("[AIController] Bắt đầu gọi AIService.generateCakeImage");

      const result = await AIService.generateCakeImage(sketch, userId);
      console.log("[AIController] Kết quả từ AIService:", {
        success: result.success,
        hasError: !!result.error,
        hasImage: !!result.data?.image,
      });

      if (!result.success) {
        console.error("[AIController] Lỗi từ AIService:", result.error);
        return res.status(500).json(result);
      }

      console.log("[AIController] Trả về kết quả thành công");
      return res.json(result);
    } catch (error) {
      console.error("[AIController] Lỗi không xử lý được:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      return res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi tạo ảnh",
        details: error.message,
      });
    }
  }

  static async getGenerationHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const result = await AIService.getGenerationHistory(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 10
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error("Lỗi trong getGenerationHistory:", error);
      return res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi lấy lịch sử tạo ảnh",
      });
    }
  }
}

module.exports = AIController;
