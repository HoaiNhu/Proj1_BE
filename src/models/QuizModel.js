const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["mood", "memory", "preference"],
      required: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
          default: null,
        },
      },
    ],
    allowCustomAnswer: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ type: 1, isActive: 1 });
quizSchema.index({ order: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
