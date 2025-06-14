const Product = require("../models/ProductModel");
const DailyPuzzle = require("../models/DailyPuzzle");
const UserPuzzleProgress = require("../models/UserPuzzleProgressModel");
const { generatePuzzle } = require("../utils/PuzzleGenerator");
const UserAssetsService = require("../services/UserAssetsService");

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
    const userId = req.user.id; // Lấy từ middleware auth
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

    // Lấy hoặc tạo progress của user cho ngày hôm nay
    let userProgress = await UserPuzzleProgress.findOne({
      userId,
      date: today,
    });
    if (!userProgress) {
      userProgress = await UserPuzzleProgress.create({
        userId,
        date: today,
        attempts: 0,
        isCompleted: false,
        coinsEarned: 0,
      });
    }

    // Kiểm tra xem user đã hoàn thành chưa
    if (userProgress.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã hoàn thành ô chữ hôm nay rồi!",
      });
    }

    // Kiểm tra xem user đã hết lượt chưa
    if (userProgress.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã hết lượt chơi cho hôm nay!",
      });
    }

    // Kiểm tra đáp án
    const userAnswer = answer.toUpperCase().trim();
    const correctAnswer = puzzle.answer.toUpperCase().trim();
    const isCorrect = userAnswer === correctAnswer;

    // Cập nhật số lượt đã thử
    userProgress.attempts += 1;

    // Xử lý logic cộng xu
    let coinsEarned = 0;
    let message = "";

    if (isCorrect) {
      // Trả lời đúng - cộng 3000 xu
      coinsEarned = 3000;
      userProgress.isCompleted = true;
      userProgress.coinsEarned = coinsEarned;
      message = `Chúc mừng! Bạn đã giải đúng và nhận được ${coinsEarned} xu!`;
    } else if (userProgress.attempts >= 3) {
      // Hết 3 lượt mà chưa trả lời đúng - cộng 1000 xu
      coinsEarned = 1000;
      userProgress.isCompleted = true;
      userProgress.coinsEarned = coinsEarned;
      message = `Hết lượt rồi! Bạn nhận được ${coinsEarned} xu để thử lại ngày mai.`;
    } else {
      // Trả lời sai nhưng còn lượt - không cộng xu
      message = `Sai rồi! Bạn còn ${3 - userProgress.attempts} lượt thử.`;
    }

    // Lưu progress
    await userProgress.save();

    // Cộng xu nếu có
    let updatedAssets = null;
    if (coinsEarned > 0) {
      updatedAssets = await UserAssetsService.addCoins(userId, coinsEarned);
    } else {
      // Lấy số xu hiện tại
      updatedAssets = await UserAssetsService.getUserAssets(userId);
    }

    res.json({
      success: true,
      data: {
        isCorrect,
        message,
        coinsEarned,
        totalCoins: updatedAssets.coins,
        attempts: userProgress.attempts,
        remainingAttempts: Math.max(0, 3 - userProgress.attempts),
        isCompleted: userProgress.isCompleted,
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

// Lấy trạng thái chơi của user cho ngày hôm nay
const getUserPuzzleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    let userProgress = await UserPuzzleProgress.findOne({
      userId,
      date: today,
    });

    if (!userProgress) {
      userProgress = {
        attempts: 0,
        isCompleted: false,
        coinsEarned: 0,
      };
    }

    res.json({
      success: true,
      data: {
        attempts: userProgress.attempts,
        isCompleted: userProgress.isCompleted,
        coinsEarned: userProgress.coinsEarned,
        remainingAttempts: Math.max(0, 3 - userProgress.attempts),
      },
    });
  } catch (err) {
    console.error("Error in getUserPuzzleProgress:", err);
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
  getUserPuzzleProgress,
};
