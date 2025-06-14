const Discount = require("../models/DiscountModel");
const Product = require("../models/ProductModel");
const mongoose = require("mongoose");

// Kiểm tra xung đột khuyến mãi
const checkDiscountConflicts = async (discount, excludeId = null) => {
  const { discountStartDate, discountEndDate, discountValue, discountProduct } = discount;

  for (const productId of discountProduct) {
    const conflicts = await Discount.find({
      _id: { $ne: excludeId },
      discountProduct: productId,
      isActive: true,
      $or: [
        {
          discountStartDate: { $lte: new Date(discountEndDate) },
          discountEndDate: { $gte: new Date(discountStartDate) },
        },
      ],
    });

    for (const conflict of conflicts) {
      if (conflict.discountValue >= discountValue) {
        return `Sản phẩm ${productId} đã có khuyến mãi mạnh hơn hoặc bằng trong thời gian trùng lặp.`;
      }
    }
  }
  return null;
};

// Tạo Discount mới
const createDiscount = (newDiscount) => {
  return new Promise(async (resolve, reject) => {
    try {
         if (typeof newDiscount.discountProduct === "string") {
        newDiscount.discountProduct = JSON.parse(newDiscount.discountProduct);
      }
      const { discountCode, discountStartDate, discountEndDate, discountProduct } = newDiscount;

      const existing = await Discount.findOne({ discountCode });
      if (existing) {
        return resolve({ status: "ERR", message: "Mã khuyến mãi đã tồn tại." });
      }
      

      if (new Date(discountStartDate) > new Date(discountEndDate)) {
        return resolve({ status: "ERR", message: "Ngày bắt đầu phải trước ngày kết thúc." });
      }

    

      for (const productId of discountProduct) {
        const exists = await Product.findById(productId);
        if (!exists) {
          return resolve({ status: "ERR", message: `Sản phẩm không tồn tại: ${productId}` });
        }
      }

      const conflictMessage = await checkDiscountConflicts(newDiscount);
      if (conflictMessage) {
        return resolve({ status: "ERR", message: conflictMessage });
      }

      const created = await Discount.create(newDiscount);
      resolve({ status: "OK", message: "Tạo khuyến mãi thành công", data: created });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi tạo khuyến mãi" });
    }
  });
};

// Cập nhật Discount
const updateDiscount = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        return resolve({ status: "ERR", message: "Không tìm thấy khuyến mãi" });
      }

      if (data.discountStartDate && data.discountEndDate) {
        if (data.discountStartDate >= data.discountEndDate) {
          return resolve({ status: "ERR", message: "Ngày bắt đầu phải trước ngày kết thúc." });
        }
      }

      if (data.discountProduct) {
        if (!Array.isArray(data.discountProduct) || data.discountProduct.length === 0) {
          return resolve({ status: "ERR", message: "Phải chọn ít nhất một sản phẩm" });
        }

        for (const productId of data.discountProduct) {
          const exists = await Product.findById(productId);
          if (!exists) {
            return resolve({ status: "ERR", message: `Sản phẩm không tồn tại: ${productId}` });
          }
        }
      }

      const conflictMessage = await checkDiscountConflicts({ ...discount.toObject(), ...data }, id);
      if (conflictMessage) {
        return resolve({ status: "ERR", message: conflictMessage });
      }

      const updated = await Discount.findByIdAndUpdate(id, data, { new: true });
      resolve({ status: "OK", message: "Cập nhật khuyến mãi thành công", data: updated });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi cập nhật khuyến mãi" });
    }
  });
};

// Xóa Discount
const deleteDiscount = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        return resolve({ status: "ERR", message: "Không tìm thấy khuyến mãi" });
      }

      await Discount.findByIdAndDelete(id);
      resolve({ status: "OK", message: "Xóa khuyến mãi thành công" });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi xóa khuyến mãi" });
    }
  });
};

// Lấy chi tiết Discount
const getDetailsDiscount = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findById(id).populate("discountProduct");
      if (!discount) {
        return resolve({ status: "ERR", message: "Không tìm thấy khuyến mãi" });
      }

      resolve({ status: "OK", message: "Lấy chi tiết khuyến mãi thành công", data: discount });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi lấy chi tiết khuyến mãi" });
    }
  });
};

// Lấy tất cả Discount
const getAllDiscount = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};
      if (filter) {
        const [field, value] = filter;
        query[field] = { $regex: value, $options: "i" };
      }

      const total = await Discount.countDocuments(query);
      const sortOption = sort ? { [sort[1]]: sort[0] } : {};

      const data = await Discount.find(query)
        .populate("discountProduct")
        .limit(limit)
        .skip(page * limit)
        .sort(sortOption);

      resolve({
        status: "OK",
        message: "Lấy danh sách khuyến mãi thành công",
        data,
        total,
        pageCurrent: page + 1,
        totalPage: Math.ceil(total / limit),
      });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi lấy danh sách khuyến mãi" });
    }
  });
};

// Kiểm tra mã Discount hợp lệ
const validateDiscount = (discountCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findOne({ discountCode });
      if (!discount || !discount.isActive) {
        return resolve({ status: "OK", message: "Mã giảm giá không hợp lệ hoặc đã hết hiệu lực" });
      }

      resolve({ status: "OK", message: "Mã giảm giá hợp lệ", data: discount });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi kiểm tra mã giảm giá" });
    }
  });
};

// Bật / Tắt trạng thái khuyến mãi
const toggleDiscountStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        return resolve({ status: "ERR", message: "Không tìm thấy khuyến mãi" });
      }

      discount.isActive = !discount.isActive;
      await discount.save();

      resolve({ status: "OK", message: "Cập nhật trạng thái khuyến mãi thành công", data: discount });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi cập nhật trạng thái" });
    }
  });
};

// Lấy danh sách sản phẩm đang áp dụng khuyến mãi mạnh nhất
const getProductsWithBestDiscount = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const discounts = await Discount.find({
        isActive: true,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
      }).populate("discountProduct");

      const productDiscountMap = new Map();

      for (const discount of discounts) {
        for (const product of discount.discountProduct) {
          const productId = product._id.toString();
          if (!productDiscountMap.has(productId) || productDiscountMap.get(productId).discountValue < discount.discountValue) {
            productDiscountMap.set(productId, {
              product,
              discountValue: discount.discountValue,
              discountName: discount.discountName,
              discountCode: discount.discountCode,
            });
          }
        }
      }

      const result = Array.from(productDiscountMap.values());
      resolve({ status: "OK", message: "Lấy sản phẩm và khuyến mãi áp dụng thành công", data: result });
    } catch (error) {
      reject({ status: "ERR", message: error.message || "Lỗi khi lấy sản phẩm và khuyến mãi áp dụng" });
    }
  });
};

module.exports = {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDetailsDiscount,
  getAllDiscount,
  validateDiscount,
  toggleDiscountStatus,
  getProductsWithBestDiscount,
};
