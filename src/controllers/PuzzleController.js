const Product = require("../models/ProductModel");
const DailyPuzzle = require("../models/DailyPuzzle");
const { generatePuzzle } = require("../utils/PuzzleGenerator");

// Lấy ô chữ của ngày hiện tại
const getDailyPuzzle = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let puzzle = await DailyPuzzle.findOne({ date: today }).populate(
      "productId"
    );

    if (!puzzle) {
      // Tạo ô chữ mới cho ngày hôm nay
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10);

      const usedProductIds = await DailyPuzzle.find()
        .sort({ date: -1 })
        .limit(10)
        .select("productId");

      const availableProducts = recentProducts.filter(
        (p) => !usedProductIds.some((id) => id.equals(p._id))
      );

      if (availableProducts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không có sản phẩm nào khả dụng cho ô chữ!",
        });
      }

      const randomProduct =
        availableProducts[Math.floor(Math.random() * availableProducts.length)];
      const {
        puzzle: newPuzzle,
        answer,
        originalName,
        missingChars,
        hiddenIndices,
        hintChars,
      } = generatePuzzle(randomProduct.productName);

      puzzle = await DailyPuzzle.create({
        date: today,
        productId: randomProduct._id,
        puzzle: newPuzzle,
        answer,
        originalProductName: originalName,
        missingChars,
        hiddenIndices,
        hintChars,
      });
    }

    res.json({
      success: true,
      data: {
        puzzle: puzzle.puzzle,
        answer: puzzle.answer,
        productLength: puzzle.answer.length,
        date: puzzle.date,
        missingChars: puzzle.missingChars || [],
        hiddenIndices: puzzle.hiddenIndices || [],
        hintChars: puzzle.hintChars || [],
      },
    });
  } catch (err) {
    console.error("Error in getDailyPuzzle:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Kiểm tra đáp án
const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const today = new Date().toISOString().split("T")[0];

    if (!answer || answer.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đáp án!",
      });
    }

    const puzzle = await DailyPuzzle.findOne({ date: today });
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: "Không có ô chữ cho hôm nay!",
      });
    }

    // Kiểm tra đáp án
    const userAnswer = answer.toUpperCase().trim();
    const correctAnswer = puzzle.answer.toUpperCase().trim();
    const isCorrect = userAnswer === correctAnswer;

    res.json({
      success: true,
      data: {
        isCorrect,
        message: isCorrect
          ? "Chúc mừng! Bạn đã giải đúng!"
          : "Sai rồi! Hãy thử lại.",
      },
    });
  } catch (err) {
    console.error("Error in submitAnswer:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Lấy thông tin sản phẩm
const getProductInfo = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const puzzle = await DailyPuzzle.findOne({ date: today }).populate(
      "productId"
    );

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: "Không có ô chữ cho hôm nay!",
      });
    }

    const product = puzzle.productId;
    res.json({
      success: true,
      data: {
        id: product._id,
        name: puzzle.originalProductName,
        image: product.productImage,
        description: product.productDescription,
        price: product.productPrice,
        category: product.productCategory,
        discount: product.productDiscount,
        rating: product.averageRating,
        totalRatings: product.totalRatings,
      },
    });
  } catch (err) {
    console.error("Error in getProductInfo:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getDailyPuzzle,
  submitAnswer,
  getProductInfo,
};
