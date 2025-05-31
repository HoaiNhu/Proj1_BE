const RatingService = require("../services/RatingService");

const createRating = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.userName;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu thông tin đánh giá",
      });
    }

    if (!userName) {
      return res.status(400).json({
        status: "ERR",
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    const response = await RatingService.createRating({
      userId,
      productId,
      orderId,
      rating,
      comment,
      userName,
    });

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu ID sản phẩm",
      });
    }

    const response = await RatingService.getProductRatings(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const getUserRating = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const userId = req.user.id;

    if (!productId || !orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu thông tin",
      });
    }

    const response = await RatingService.getUserRating(
      userId,
      productId,
      orderId
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!ratingId || !rating) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu thông tin đánh giá",
      });
    }

    const response = await RatingService.updateRating(ratingId, userId, {
      rating,
      comment,
    });

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  createRating,
  getProductRatings,
  getUserRating,
  updateRating,
};
