const axios = require("axios");

const FASTAPI_URL =
  process.env.FASTAPI_URL || "https://fastapi-rcm.onrender.com";

const getRecommendations = async (userId, productId) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/recommend`, {
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
      `${FASTAPI_URL}/interaction/log`,
      interaction
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lưu tương tác");
  }
};

const getQuizRecommendations = async (userId, sessionId) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/recommend/quiz`, {
      user_id: userId,
      session_id: sessionId,
    });
    return response.data.recommendations;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Không thể lấy gợi ý từ quiz"
    );
  }
};

module.exports = { getRecommendations, logInteraction, getQuizRecommendations };
