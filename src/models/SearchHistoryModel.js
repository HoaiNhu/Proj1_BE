const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    query: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const SearchHistory = mongoose.model("SearchHistory", SearchHistorySchema);
module.exports = SearchHistory;
