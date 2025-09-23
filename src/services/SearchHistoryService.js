const SearchHistory = require("../models/SearchHistoryModel");
const mongoose = require("mongoose");

class SearchHistoryService {
  // Lưu lịch sử tìm kiếm mới
  async saveSearchHistory(userId, query) {
    try {
      console.log("🎯 SearchHistoryService - saveSearchHistory called:", {
        userId,
        query,
      });

      // Kiểm tra xem query đã tồn tại cho user này chưa
      const existingSearch = await SearchHistory.findOne({
        userId,
        query: query.toLowerCase(),
      });

      console.log("🔍 Existing search found:", existingSearch);

      if (existingSearch) {
        // Cập nhật timestamp nếu đã tồn tại
        console.log("🔄 Updating existing search...");
        existingSearch.timestamp = new Date();
        const savedSearch = await existingSearch.save();
        console.log("✅ Updated search saved:", savedSearch);
        return savedSearch;
      } else {
        // Tạo mới nếu chưa tồn tại
        console.log("🆕 Creating new search history...");
        const newSearchHistory = new SearchHistory({
          userId,
          query: query.toLowerCase(),
          timestamp: new Date(),
        });
        console.log("📋 New search object:", newSearchHistory);

        const savedSearch = await newSearchHistory.save();
        console.log("✅ New search saved to DB:", savedSearch);
        return savedSearch;
      }
    } catch (error) {
      console.error("❌ SearchHistoryService error:", error);
      throw new Error(`Không thể lưu lịch sử tìm kiếm: ${error.message}`);
    }
  }

  // Lấy lịch sử tìm kiếm của user
  async getSearchHistory(userId, limit = 10) {
    try {
      const searchHistory = await SearchHistory.find({ userId })
        .sort({ timestamp: -1 }) // Sắp xếp theo thời gian mới nhất
        .limit(limit)
        .select("query timestamp");

      return searchHistory;
    } catch (error) {
      throw new Error(`Không thể lấy lịch sử tìm kiếm: ${error.message}`);
    }
  }

  // Xóa một mục lịch sử tìm kiếm
  async deleteSearchHistory(userId, searchHistoryId) {
    try {
      const deletedHistory = await SearchHistory.findOneAndDelete({
        _id: searchHistoryId,
        userId, // Đảm bảo chỉ user sở hữu mới có thể xóa
      });

      if (!deletedHistory) {
        throw new Error(
          "Không tìm thấy lịch sử tìm kiếm hoặc bạn không có quyền xóa"
        );
      }

      return deletedHistory;
    } catch (error) {
      throw new Error(`Không thể xóa lịch sử tìm kiếm: ${error.message}`);
    }
  }

  // Xóa toàn bộ lịch sử tìm kiếm của user
  async clearAllSearchHistory(userId) {
    try {
      const result = await SearchHistory.deleteMany({ userId });
      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Đã xóa ${result.deletedCount} mục lịch sử tìm kiếm`,
      };
    } catch (error) {
      throw new Error(
        `Không thể xóa tất cả lịch sử tìm kiếm: ${error.message}`
      );
    }
  }

  // Lấy các từ khóa tìm kiếm phổ biến
  async getPopularSearches(limit = 5) {
    try {
      const popularSearches = await SearchHistory.aggregate([
        {
          $group: {
            _id: "$query",
            count: { $sum: 1 },
            lastUsed: { $max: "$timestamp" },
          },
        },
        {
          $sort: { count: -1, lastUsed: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            query: "$_id",
            count: 1,
            lastUsed: 1,
            _id: 0,
          },
        },
      ]);

      return popularSearches;
    } catch (error) {
      throw new Error(`Không thể lấy từ khóa phổ biến: ${error.message}`);
    }
  }

  // Tìm kiếm gợi ý dựa trên lịch sử
  async getSearchSuggestions(userId, partialQuery, limit = 5) {
    try {
      const suggestions = await SearchHistory.find({
        userId,
        query: { $regex: partialQuery.toLowerCase(), $options: "i" },
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select("query")
        .distinct("query");

      return suggestions;
    } catch (error) {
      throw new Error(`Không thể lấy gợi ý tìm kiếm: ${error.message}`);
    }
  }
}

module.exports = new SearchHistoryService();
