const recommendationService = require("../services/RecommendationService");

const getRecommendations = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu userId hoặc productId",
      });
    }
    const recommendations = await recommendationService.getRecommendations(
      userId,
      productId
    );
    res.status(200).json({
      status: "OK",
      message: "Khuyến nghị được lấy thành công",
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const logInteraction = async (req, res) => {
  try {
    const interaction = req.body;
    await recommendationService.logInteraction(interaction);
    res.status(200).json({
      status: "OK",
      message: "Tương tác đã được lưu",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

module.exports = { getRecommendations, logInteraction };
