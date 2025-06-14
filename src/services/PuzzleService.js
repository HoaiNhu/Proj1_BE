const Product = require("../models/ProductModel");
const DailyPuzzle = require("../models/DailyPuzzle");
const { generatePuzzle } = require("../utils/PuzzleGenerator");

class PuzzleService {
  // Tạo ô chữ mới cho ngày hôm nay
  static async createDailyPuzzle() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Kiểm tra xem đã có ô chữ cho hôm nay chưa
      const existing = await DailyPuzzle.findOne({ date: today });
      if (existing) {
        return {
          success: false,
          message: "Ô chữ cho hôm nay đã tồn tại",
          data: existing,
        };
      }

      // Lấy 10 sản phẩm mới nhất
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10);

      if (recentProducts.length === 0) {
        return {
          success: false,
          message: "Không có sản phẩm nào trong hệ thống",
        };
      }

      // Lấy danh sách sản phẩm đã được sử dụng trong 10 ngày gần nhất
      const usedProductIds = await DailyPuzzle.find()
        .sort({ date: -1 })
        .limit(10)
        .select("productId");

      // Lọc ra các sản phẩm chưa được sử dụng
      const availableProducts = recentProducts.filter(
        (p) => !usedProductIds.some((id) => id.equals(p._id))
      );

      if (availableProducts.length === 0) {
        return {
          success: false,
          message: "Không có sản phẩm nào khả dụng cho ô chữ",
        };
      }

      // Chọn ngẫu nhiên một sản phẩm
      const randomProduct =
        availableProducts[Math.floor(Math.random() * availableProducts.length)];

      // Tạo ô chữ
      const { puzzle, answer, originalName } = generatePuzzle(
        randomProduct.productName
      );

      // Lưu vào database
      const newPuzzle = await DailyPuzzle.create({
        date: today,
        productId: randomProduct._id,
        puzzle,
        answer,
        originalProductName: originalName,
      });

      return {
        success: true,
        message: "Tạo ô chữ thành công",
        data: {
          puzzle: newPuzzle.puzzle,
          answer: newPuzzle.answer,
          originalName: newPuzzle.originalProductName,
          productId: newPuzzle.productId,
        },
      };
    } catch (error) {
      console.error("Error creating daily puzzle:", error);
      return {
        success: false,
        message: "Lỗi khi tạo ô chữ",
        error: error.message,
      };
    }
  }

  // Lấy ô chữ của ngày hiện tại
  static async getDailyPuzzle() {
    try {
      const today = new Date().toISOString().split("T")[0];

      let puzzle = await DailyPuzzle.findOne({ date: today }).populate(
        "productId"
      );

      if (!puzzle) {
        // Tạo ô chữ mới nếu chưa có
        const createResult = await this.createDailyPuzzle();
        if (!createResult.success) {
          return createResult;
        }
        puzzle = await DailyPuzzle.findOne({ date: today }).populate(
          "productId"
        );
      }

      return {
        success: true,
        data: {
          puzzle: puzzle.puzzle,
          productLength: puzzle.answer.length,
          date: puzzle.date,
        },
      };
    } catch (error) {
      console.error("Error getting daily puzzle:", error);
      return {
        success: false,
        message: "Lỗi khi lấy ô chữ",
        error: error.message,
      };
    }
  }

  // Kiểm tra đáp án
  static async submitAnswer(answer) {
    try {
      if (!answer || answer.trim() === "") {
        return {
          success: false,
          message: "Vui lòng nhập đáp án!",
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const puzzle = await DailyPuzzle.findOne({ date: today });

      if (!puzzle) {
        return {
          success: false,
          message: "Không có ô chữ cho hôm nay!",
        };
      }

      // Kiểm tra đáp án
      const userAnswer = answer.toUpperCase().trim();
      const correctAnswer = puzzle.answer.toUpperCase().trim();
      const isCorrect = userAnswer === correctAnswer;

      return {
        success: true,
        data: {
          isCorrect,
          message: isCorrect
            ? "Chúc mừng! Bạn đã giải đúng!"
            : "Sai rồi! Hãy thử lại.",
        },
      };
    } catch (error) {
      console.error("Error submitting answer:", error);
      return {
        success: false,
        message: "Lỗi khi kiểm tra đáp án",
        error: error.message,
      };
    }
  }

  // Lấy thông tin sản phẩm
  static async getProductInfo() {
    try {
      const today = new Date().toISOString().split("T")[0];

      const puzzle = await DailyPuzzle.findOne({ date: today }).populate(
        "productId"
      );
      if (!puzzle) {
        return {
          success: false,
          message: "Không có ô chữ cho hôm nay!",
        };
      }

      const product = puzzle.productId;
      return {
        success: true,
        data: {
          name: puzzle.originalProductName,
          image: product.productImage,
          description: product.productDescription,
          price: product.productPrice,
          category: product.productCategory,
          discount: product.productDiscount,
          rating: product.averageRating,
        },
      };
    } catch (error) {
      console.error("Error getting product info:", error);
      return {
        success: false,
        message: "Lỗi khi lấy thông tin sản phẩm",
        error: error.message,
      };
    }
  }
}

module.exports = PuzzleService;
