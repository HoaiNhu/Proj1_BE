const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    statusCode: {
      type: String,
      required: true,
      unique: true,
      enum: ["PENDING", "PROCESSING", "DELIVERING", "COMPLETED", "CANCELLED"],
    },
    statusName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
