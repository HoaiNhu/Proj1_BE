const mongoose = require("mongoose");

const userQuizResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    customAnswer: {
      type: String,
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
      // Dùng để nhóm các câu trả lời của một lần làm quiz
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userQuizResponseSchema.index({ userId: 1, quizId: 1 });
userQuizResponseSchema.index({ sessionId: 1 });
userQuizResponseSchema.index({ createdAt: 1 });

const UserQuizResponse = mongoose.model(
  "UserQuizResponse",
  userQuizResponseSchema
);

module.exports = UserQuizResponse;
