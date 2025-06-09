const DiscountService = require("../services/DiscountService");
const Product= require("../models/ProductModel")
///create discount
const createDiscount = async (req, res) => {
  try {
    //test input data
    const {
  discountCode,
  discountName,
  discountValue,
  discountStartDate,
  discountEndDate,
} = req.body;

    const discountProductRaw = req.body.discountProduct;
let discountProduct = [];

try {
  discountProduct = JSON.parse(discountProductRaw);
} catch (err) {
  return res.status(400).json({
    status: "ERR",
    message: "Invalid format for discountProduct",
  });
}

    const discountImage= req.file.path;
    const newDiscount={
      discountCode,
      discountName,
      discountValue,
      discountProduct,
      discountImage,
      discountStartDate,
      discountEndDate,
    }
    console.log("NEW", newDiscount)
    const response = await DiscountService.createDiscount(newDiscount);
      //  console.log("NEW2", newDiscount)
    return res.status(200).json(response);
  } catch (e) {
    console.log("err", e)
    return res.status(404).json({
      message: e,
    });
  }
};

// Cập nhật khuyến mãi
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await DiscountService.updateDiscount(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Xóa khuyến mãi
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await DiscountService.deleteDiscount(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Lấy chi tiết khuyến mãi theo ID
const getDetailsDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await DiscountService.getDetailsDiscount(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Lấy danh sách khuyến mãi (phân trang, lọc, sắp xếp)
const getAllDiscount = async (req, res) => {
  try {
    let { limit, page, sortBy, sortDir, filterField, filterValue } = req.query;

    limit = parseInt(limit) || 10;
    page = parseInt(page) || 0;

    const sort = sortBy && sortDir ? [sortDir.toLowerCase() === "desc" ? -1 : 1, sortBy] : null;
    const filter = filterField && filterValue ? [filterField, filterValue] : null;

    const response = await DiscountService.getAllDiscount(limit, page, sort, filter);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Kiểm tra mã giảm giá hợp lệ
const validateDiscount = async (req, res) => {
  try {
    const { discountCode } = req.params;
    const response = await DiscountService.validateDiscount(discountCode);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Bật / Tắt trạng thái khuyến mãi
const toggleDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await DiscountService.toggleDiscountStatus(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDetailsDiscount,
  getAllDiscount,
  validateDiscount,
  toggleDiscountStatus,
};
