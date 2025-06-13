const Product = require("../models/product");
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
        return res
          .status(404)
          .json({ message: "No available products for puzzle!" });
      }
      const randomProduct =
        availableProducts[Math.floor(Math.random() * availableProducts.length)];
      const { puzzle: newPuzzle, answer } = generatePuzzle(randomProduct.name);
      puzzle = await DailyPuzzle.create({
        date: today,
        productId: randomProduct._id,
        puzzle: newPuzzle,
        answer,
      });
    }
    res.json({
      puzzle: puzzle.puzzle,
      productLength: puzzle.answer.length,
      date: puzzle.date,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Kiểm tra đáp án
const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const puzzle = await DailyPuzzle.findOne({ date: today });
    if (!puzzle) {
      return res.status(404).json({ message: "No puzzle for today!" });
    }
    const success = answer.toUpperCase() === puzzle.answer.toUpperCase();
    res.json({
      success,
      message: success ? "Chúc mừng! Bạn đã giải đúng!" : "Hẹn gặp lại sau!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "No puzzle for today!" });
    }
    const product = puzzle.productId;
    res.json({
      name: product.name,
      image: product.image,
      description: product.description,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDailyPuzzle, submitAnswer, getProductInfo };
