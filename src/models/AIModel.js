const mongoose = require("mongoose");

const AIGenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sketchImage: {
      type: String, // Base64 encoded sketch
      required: true,
    },
    generatedImage: {
      type: String, // Base64 encoded generated image
      default: "", // Cho phép rỗng ban đầu
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AIGeneration", AIGenerationSchema);
