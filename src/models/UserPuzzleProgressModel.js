const mongoose = require("mongoose");

const userPuzzleProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    coinsEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index để đảm bảo mỗi user chỉ có 1 record cho mỗi ngày
userPuzzleProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UserPuzzleProgress", userPuzzleProgressSchema);
