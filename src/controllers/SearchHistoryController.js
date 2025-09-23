const SearchHistoryService = require("../services/SearchHistoryService");
const { validationResult } = require("express-validator");

class SearchHistoryController {
  // POST /api/search-history - Lưu lịch sử tìm kiếm
  async saveSearchHistory(req, res) {
    try {
      // Debug logging
      console.log("SaveSearchHistory - req.user:", req.user);
      console.log("SaveSearchHistory - req.body:", req.body);

      // Kiểm tra validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors: errors.array(),
        });
      }

      const { query } = req.body;

      // Kiểm tra xem req.user có tồn tại không
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message:
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        });
      }

      const userId = req.user.id;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Query tìm kiếm không được để trống",
        });
      }

      const searchHistory = await SearchHistoryService.saveSearchHistory(
        userId,
        query.trim()
      );

      res.status(201).json({
        success: true,
        message: "Lưu lịch sử tìm kiếm thành công",
        data: {
          id: searchHistory._id,
          query: searchHistory.query,
          timestamp: searchHistory.timestamp,
        },
      });
    } catch (error) {
      console.error("Error saving search history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lưu lịch sử tìm kiếm",
      });
    }
  }

  // GET /api/search-history - Lấy lịch sử tìm kiếm của user
  async getSearchHistory(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      if (limit > 50) {
        return res.status(400).json({
          success: false,
          message: "Limit không được vượt quá 50",
        });
      }

      const searchHistory = await SearchHistoryService.getSearchHistory(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        message: "Lấy lịch sử tìm kiếm thành công",
        data: searchHistory,
        count: searchHistory.length,
      });
    } catch (error) {
      console.error("Error getting search history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy lịch sử tìm kiếm",
      });
    }
  }

  // DELETE /api/search-history/:id - Xóa một mục lịch sử tìm kiếm
  async deleteSearchHistory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ",
        });
      }

      const deletedHistory = await SearchHistoryService.deleteSearchHistory(
        userId,
        id
      );

      res.status(200).json({
        success: true,
        message: "Xóa lịch sử tìm kiếm thành công",
        data: {
          id: deletedHistory._id,
          query: deletedHistory.query,
        },
      });
    } catch (error) {
      console.error("Error deleting search history:", error);

      if (error.message.includes("Không tìm thấy")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi xóa lịch sử tìm kiếm",
      });
    }
  }

  // DELETE /api/search-history - Xóa toàn bộ lịch sử tìm kiếm
  async clearAllSearchHistory(req, res) {
    try {
      const userId = req.user.id;
      const result = await SearchHistoryService.clearAllSearchHistory(userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          deletedCount: result.deletedCount,
        },
      });
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi xóa tất cả lịch sử tìm kiếm",
      });
    }
  }

  // GET /api/search-history/popular - Lấy từ khóa phổ biến
  async getPopularSearches(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      if (limit > 20) {
        return res.status(400).json({
          success: false,
          message: "Limit không được vượt quá 20",
        });
      }

      const popularSearches = await SearchHistoryService.getPopularSearches(
        limit
      );

      res.status(200).json({
        success: true,
        message: "Lấy từ khóa phổ biến thành công",
        data: popularSearches,
        count: popularSearches.length,
      });
    } catch (error) {
      console.error("Error getting popular searches:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy từ khóa phổ biến",
      });
    }
  }

  // GET /api/search-history/suggestions - Lấy gợi ý tìm kiếm
  async getSearchSuggestions(req, res) {
    try {
      const { q } = req.query;
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 5;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Query không được để trống",
        });
      }

      if (limit > 10) {
        return res.status(400).json({
          success: false,
          message: "Limit không được vượt quá 10",
        });
      }

      const suggestions = await SearchHistoryService.getSearchSuggestions(
        userId,
        q.trim(),
        limit
      );

      res.status(200).json({
        success: true,
        message: "Lấy gợi ý tìm kiếm thành công",
        data: suggestions,
        count: suggestions.length,
      });
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy gợi ý tìm kiếm",
      });
    }
  }
}

module.exports = new SearchHistoryController();
