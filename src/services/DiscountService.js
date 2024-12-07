const Discount = require("../models/DiscountModel");

//tạo Discount
const createDiscount = (newDiscount) => {
  return new Promise(async (resolve, reject) => {
    const {
      discountCode,
      discountName,
      discountValue,
      discountType,
      applicableCategory,
      discountStartDate,
      discountEndDate,
      isActive,
    } = newDiscount;

    try {
      //check tên sản phẩm
      const checkDiscount = await Discount.findOne({
        name: discountName,
      });
      //nếu name Discount đã tồn tại
      if (checkDiscount !== null) {
        resolve({
          status: "OK",
          message: "The name of Discount is already",
        });
      }

      const createdDiscount = await Discount.create({
        discountCode,
        discountName,
        discountValue,
        discountType,
        applicableCategory,
        discountStartDate,
        discountEndDate,
        isActive,
      });
      if (createdDiscount) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdDiscount,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update Discount
const updateDiscount = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkDiscount = await Discount.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu Discount ko tồn tại
      if (checkDiscount === null) {
        resolve({
          status: "OK",
          message: "The Discount is not defined",
        });
      }

      const updatedDiscount = await Discount.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedDiscount", updatedDiscount);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedDiscount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete Discount
const deleteDiscount = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check Discount created
      const checkDiscount = await Discount.findOne({
        _id: id,
      });
      //console.log("checkDiscount", checkDiscount);

      //nếu Discount ko tồn tại
      if (checkDiscount === null) {
        resolve({
          status: "OK",
          message: "The Discount is not defined",
        });
      }

      await Discount.findByIdAndDelete(id);
      //console.log("updatedDiscount", updatedDiscount);
      resolve({
        status: "OK",
        message: "DELETE Discount IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get details Discount
const getDetailsDiscount = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const Discount = await Discount.findOne({
        _id: id,
      });

      //nếu Discount ko tồn tại
      if (Discount === null) {
        resolve({
          status: "OK",
          message: "The Discount is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: Discount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get all Discount
const getAllDiscount = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalDiscount = await Discount.countDocuments();

      if (filter) {
        const label = filter[0];
        const allDiscountFilter = await Discount.find({
          [label]: { $regex: filter[1] },
        })
          .limit(limit)
          .skip(page * limit); //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Discount IS SUCCESS",
          data: allDiscountFilter,
          total: totalDiscount,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalDiscount / limit),
        });
      }

      if (sort) {
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allDiscountSort = await Discount.find()
          .limit(limit)
          .skip(page * limit)
          .sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Discount IS SUCCESS",
          data: allDiscountSort,
          total: totalDiscount,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalDiscount / limit),
        });
      }

      const allDiscount = await Discount.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Discount IS SUCCESS",
        data: allDiscount,
        total: totalDiscount,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalDiscount / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

//apply discount
const applyDiscount = (orderId, discountCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findOne({ discountCode });
      if (!discount || !discount.isActive) {
        resolve({
          status: "OK",
          message: "Discount is invalid or inactive",
        });
        return;
      }

      // Logic to apply discount to order (có thể thêm vào logic tính toán discount vào đơn hàng)
      resolve({
        status: "OK",
        message: "Discount applied successfully",
        data: discount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//validate discount
const validateDiscount = (discountCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findOne({ discountCode });
      if (!discount || !discount.isActive) {
        resolve({
          status: "OK",
          message: "Invalid or inactive discount code",
        });
        return;
      }

      // Logic to validate discount
      resolve({
        status: "OK",
        message: "Discount is valid",
        data: discount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get user discount
const getUserDiscounts = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discounts = await Discount.find({ applicableCategory: userId }); // Giả sử lọc theo userId hoặc thông tin người dùng
      resolve({
        status: "OK",
        message: "User discounts fetched successfully",
        data: discounts,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//active discount
const toggleDiscountStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const discount = await Discount.findOne({ _id: id });
      if (!discount) {
        resolve({
          status: "OK",
          message: "Discount not found",
        });
        return;
      }

      discount.isActive = !discount.isActive;
      await discount.save();

      resolve({
        status: "OK",
        message: "Discount status toggled",
        data: discount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDetailsDiscount,
  getAllDiscount,
  applyDiscount,
  validateDiscount,
  getUserDiscounts,
  toggleDiscountStatus,
};
