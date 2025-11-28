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
      // Only return visible ratings for public view
      const ratings = await Rating.find({ productId, isVisible: true })
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

// Admin: Get all ratings with filters
const getAllRatings = async (filters = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { search, sortBy = "createdAt", sortOrder = "desc" } = filters;

      let query = {};

      // Apply search filter
      if (search) {
        query.$or = [
          { userName: { $regex: search, $options: "i" } },
          { comment: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      const ratings = await Rating.find(query)
        .populate("userId", "userName email")
        .populate("productId", "productName productCode")
        .populate({
          path: "orderId",
          select: "orderCode",
          options: { strictPopulate: false }, // Allow null values
        })
        .sort(sort)
        .lean(); // Convert to plain objects

      resolve({
        status: "OK",
        message: "Lấy danh sách đánh giá thành công",
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

// Admin: Delete rating
const deleteRating = async (ratingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rating = await Rating.findById(ratingId);
      if (!rating) {
        return reject({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

      await Rating.findByIdAndDelete(ratingId);

      // Recalculate product average rating
      const allRatings = await Rating.find({ productId: rating.productId });
      if (allRatings.length > 0) {
        const totalRating = allRatings.reduce(
          (sum, item) => sum + item.rating,
          0
        );
        const averageRating = totalRating / allRatings.length;
        await Product.findByIdAndUpdate(rating.productId, {
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings: allRatings.length,
        });
      } else {
        await Product.findByIdAndUpdate(rating.productId, {
          averageRating: 0,
          totalRatings: 0,
        });
      }

      resolve({
        status: "OK",
        message: "Xóa đánh giá thành công",
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

// Admin: Toggle rating visibility
const toggleRatingVisibility = async (ratingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rating = await Rating.findById(ratingId);
      if (!rating) {
        return reject({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

      rating.isVisible = !rating.isVisible;
      await rating.save();

      // Populate để trả về đầy đủ thông tin
      const populatedRating = await Rating.findById(ratingId)
        .populate("userId", "userName email")
        .populate("productId", "productName productCode")
        .populate({
          path: "orderId",
          select: "orderCode",
          options: { strictPopulate: false },
        })
        .lean();

      resolve({
        status: "OK",
        message: `Đánh giá đã được ${rating.isVisible ? "hiển thị" : "ẩn"}`,
        data: populatedRating,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

// Admin: Delete multiple ratings
const deleteMultipleRatings = async (ratingIds) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get all ratings to be deleted for product recalculation
      const ratings = await Rating.find({ _id: { $in: ratingIds } });
      const productIds = [
        ...new Set(ratings.map((r) => r.productId.toString())),
      ];

      // Delete all ratings
      await Rating.deleteMany({ _id: { $in: ratingIds } });

      // Recalculate average rating for affected products
      for (const productId of productIds) {
        const remainingRatings = await Rating.find({ productId });
        if (remainingRatings.length > 0) {
          const totalRating = remainingRatings.reduce(
            (sum, item) => sum + item.rating,
            0
          );
          const averageRating = totalRating / remainingRatings.length;
          await Product.findByIdAndUpdate(productId, {
            averageRating: Number(averageRating.toFixed(1)),
            totalRatings: remainingRatings.length,
          });
        } else {
          await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            totalRatings: 0,
          });
        }
      }

      resolve({
        status: "OK",
        message: "Xóa đánh giá thành công",
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
  getAllRatings,
  deleteRating,
  toggleRatingVisibility,
  deleteMultipleRatings,
};
