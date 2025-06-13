const mongoose = require("mongoose");

const dailyPuzzleSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    puzzle: { type: String, required: true },
    answer: { type: String, required: true },
    originalProductName: { type: String, required: true },
    missingChars: [{ type: String }],
    hiddenIndices: [{ type: Number }],
    hintChars: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyPuzzle", dailyPuzzleSchema);
