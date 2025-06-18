const axios = require("axios");
const Rating = require("../models/RatingModel");
const Product = require("../models/ProductModel");

const createRating = async (ratingData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId, productId, orderId, rating, comment, userName } =
        ratingData;

      // Kiểm tra xem đã đánh giá chưa
      const existingRating = await Rating.findOne({
        userId,
        productId,
        orderId,
      });

      // Lấy thông tin sản phẩm hiện tại
      const product = await Product.findById(productId);
      if (!product) {
        return reject({
          status: "ERR",
          message: "Không tìm thấy sản phẩm",
        });
      }

      if (existingRating) {
        // Nếu đã đánh giá, cập nhật đánh giá cũ
        const oldRating = existingRating.rating;
        existingRating.rating = rating;
        existingRating.comment = comment;
        await existingRating.save();

        // Tính lại điểm trung bình
        const allRatings = await Rating.find({ productId });
        const totalRating = allRatings.reduce(
          (sum, item) => sum + item.rating,
          0
        );
        const averageRating = totalRating / allRatings.length;

        // Cập nhật rating trung bình và tổng số đánh giá
        await Product.findByIdAndUpdate(productId, {
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings: allRatings.length,
        });

        return resolve({
          status: "OK",
          message: "Cập nhật đánh giá thành công",
          data: existingRating,
        });
      }

      // Tạo đánh giá mới
      const newRating = await Rating.create({
        userId,
        productId,
        orderId,
        rating,
        comment,
        userName,
      });

      // Tính lại điểm trung bình
      const allRatings = await Rating.find({ productId });
      const totalRating = allRatings.reduce(
        (sum, item) => sum + item.rating,
        0
      );
      const averageRating = totalRating / allRatings.length;

      // Cập nhật rating trung bình và tổng số đánh giá
      await Product.findByIdAndUpdate(productId, {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: allRatings.length,
      });

      // Gọi API FastAPI để cập nhật mô hình khuyến nghị
      try {
        await axios.post(
          `${process.env.FASTAPI_URL}/update-model`,
          {},
          {
            timeout: 30000, // 30 giây timeout
          }
        );
        console.log("update model success");
      } catch (error) {
        console.error("Lỗi khi cập nhật mô hình khuyến nghị:", error);
      }

      resolve({
        status: "OK",
        message: "Đánh giá thành công",
        data: newRating,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

const getProductRatings = async (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ratings = await Rating.find({ productId })
        .sort({ createdAt: -1 })
        .populate("userId", "userName");

      resolve({
        status: "OK",
        message: "Lấy đánh giá thành công",
        data: ratings,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

const getUserRating = async (userId, productId, orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rating = await Rating.findOne({
        userId,
        productId,
        orderId,
      });

      resolve({
        status: "OK",
        message: "Lấy đánh giá thành công",
        data: rating,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

const updateRating = async (ratingId, userId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { rating, comment } = updateData;

      // Tìm đánh giá cần cập nhật
      const existingRating = await Rating.findOne({ _id: ratingId, userId });

      if (!existingRating) {
        return reject({
          status: "ERR",
          message: "Không tìm thấy đánh giá hoặc bạn không có quyền cập nhật",
        });
      }

      // Cập nhật đánh giá
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();

      // Tính lại điểm trung bình
      const allRatings = await Rating.find({
        productId: existingRating.productId,
      });
      const totalRating = allRatings.reduce(
        (sum, item) => sum + item.rating,
        0
      );
      const averageRating = totalRating / allRatings.length;

      // Cập nhật rating trung bình và tổng số đánh giá
      await Product.findByIdAndUpdate(existingRating.productId, {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: allRatings.length,
      });

      // Gọi API FastAPI để cập nhật mô hình khuyến nghị
      try {
        await axios.post(
          `${process.env.FASTAPI_URL}/update-model`,
          {},
          {
            timeout: 30000, // 30 giây timeout
          }
        );
        console.log("update model success");
      } catch (error) {
        console.error("Lỗi khi cập nhật mô hình khuyến nghị:", error);
      }

      resolve({
        status: "OK",
        message: "Cập nhật đánh giá thành công",
        data: existingRating,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

module.exports = {
  createRating,
  getProductRatings,
  getUserRating,
  updateRating,
};
