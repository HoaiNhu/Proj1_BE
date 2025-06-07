const axios = require("axios");
const AIGeneration = require("../models/AIModel");

class AIService {
  static async generateCakeImage(sketchData, userId) {
    let generation = null;
    try {
      console.log("[AIService] Bắt đầu tạo ảnh cho user:", userId);
      console.log("[AIService] Kích thước sketch data:", sketchData.length);

      // Tạo bản ghi mới trong database
      generation = new AIGeneration({
        userId,
        sketchImage: sketchData,
        status: "pending",
      });
      await generation.save();
      console.log(
        "[AIService] Đã lưu bản ghi tạm thời với ID:",
        generation._id
      );

      // Kiểm tra URL của CAKE_DIFFUSION service
      const cakeDiffusionUrl = process.env.CAKE_DIFFUSION_API_URL;
      console.log("[AIService] CAKE_DIFFUSION_API_URL:", cakeDiffusionUrl);

      if (!cakeDiffusionUrl) {
        throw new Error("CAKE_DIFFUSION_API_URL chưa được cấu hình");
      }

      // Gọi API tạo ảnh từ CAKE_DIFFUSION service
      const apiUrl = `${cakeDiffusionUrl}/generate-cake`;
      console.log("[AIService] Đang gọi API tạo ảnh đến:", apiUrl);

      try {
        console.log("[AIService] Chuẩn bị gửi request với sketch data...");
        const response = await axios.post(
          apiUrl,
          {
            sketch: sketchData,
          },
          {
            timeout: 30000, // Tăng timeout lên 30 giây
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("[AIService] Response status:", response.status);
        console.log("[AIService] Response headers:", response.headers);

        if (!response.data) {
          console.error("[AIService] Response không có data");
          throw new Error("Không nhận được data từ AI service");
        }

        if (!response.data.image) {
          console.error("[AIService] Response không chứa ảnh:", response.data);
          throw new Error("Không nhận được ảnh từ AI service");
        }

        console.log(
          "[AIService] Đã nhận ảnh từ API, kích thước:",
          response.data.image.length
        );

        // Cập nhật bản ghi với ảnh đã tạo
        generation.generatedImage = response.data.image;
        generation.status = "completed";
        await generation.save();
        console.log("[AIService] Đã cập nhật bản ghi với ảnh đã tạo");

        return {
          success: true,
          data: {
            image: response.data.image,
            generationId: generation._id,
          },
        };
      } catch (apiError) {
        console.error("[AIService] Lỗi khi gọi CAKE_DIFFUSION API:", {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          headers: apiError.response?.headers,
          code: apiError.code,
          stack: apiError.stack,
        });

        if (apiError.code === "ECONNABORTED") {
          throw new Error("Request timeout khi gọi AI service");
        }

        if (apiError.response) {
          throw new Error(
            `Lỗi từ AI service: ${apiError.response.status} - ${apiError.response.statusText}`
          );
        }

        throw apiError;
      }
    } catch (error) {
      console.error("[AIService] Chi tiết lỗi:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      // Cập nhật trạng thái lỗi nếu có bản ghi
      if (generation) {
        generation.status = "failed";
        generation.error = error.message;
        await generation.save();
        console.log(
          "[AIService] Đã cập nhật trạng thái lỗi cho bản ghi:",
          generation._id
        );
      }

      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi tạo ảnh",
      };
    }
  }

  static async getGenerationHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const generations = await AIGeneration.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await AIGeneration.countDocuments({ userId });

      return {
        success: true,
        data: {
          generations,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi lấy lịch sử",
      };
    }
  }
}

module.exports = AIService;
