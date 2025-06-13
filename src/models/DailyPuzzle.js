const mongoose = require("mongoose");

const dailyPuzzleSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  puzzle: { type: String, required: true },
  answer: { type: String, required: true },
});

module.exports = mongoose.model("DailyPuzzle", dailyPuzzleSchema);
