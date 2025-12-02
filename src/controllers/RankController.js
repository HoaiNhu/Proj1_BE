const RankService = require("../services/RankService");

/**
 * Tạo rank mới
 */
const createRank = async (req, res) => {
  try {
    const response = await RankService.createRank(req.body);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createRank:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy tất cả ranks
 */
const getAllRanks = async (req, res) => {
  try {
    const response = await RankService.getAllRanks();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllRanks:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy chi tiết rank
 */
const getRankById = async (req, res) => {
  try {
    const rankId = req.params.id;
    const response = await RankService.getRankById(rankId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getRankById:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Cập nhật rank
 */
const updateRank = async (req, res) => {
  try {
    const rankId = req.params.id;
    const response = await RankService.updateRank(rankId, req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateRank:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Xóa rank
 */
const deleteRank = async (req, res) => {
  try {
    const rankId = req.params.id;
    const response = await RankService.deleteRank(rankId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteRank:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy rank của user
 */
const getUserRank = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await RankService.getUserRank(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getUserRank:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy lịch sử thăng hạng
 */
const getUserRankHistory = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await RankService.getUserRankHistory(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getUserRankHistory:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy thống kê ranks
 */
const getRankStatistics = async (req, res) => {
  try {
    const response = await RankService.getRankStatistics();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getRankStatistics:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Khởi tạo ranks mặc định
 * Chỉ dùng 1 lần khi setup hệ thống
 */
const initializeDefaultRanks = async (req, res) => {
  try {
    const response = await RankService.initializeDefaultRanks();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in initializeDefaultRanks:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createRank,
  getAllRanks,
  getRankById,
  updateRank,
  deleteRank,
  getUserRank,
  getUserRankHistory,
  getRankStatistics,
  initializeDefaultRanks,
};
