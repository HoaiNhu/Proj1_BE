const axios = require("axios");

const getRecommendations = async (userId, productId) => {
  try {
    const response = await axios.post("http://localhost:8000/recommend", {
      user_id: userId,
      product_id: productId,
    });
    return response.data.recommendations;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy khuyến nghị"
    );
  }
};

const logInteraction = async (interaction) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/interaction/log",
      interaction
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lưu tương tác");
  }
};

module.exports = { getRecommendations, logInteraction };
