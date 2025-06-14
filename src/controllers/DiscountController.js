const DiscountService = require("../services/DiscountService");

// Tạo khuyến mãi mới
const createDiscount = async (req, res) => {
  try {
    const data = req.body;

    // Nếu có file ảnh thì gán vào discountImage
    if (req.file) {
      data.discountImage = req.file.path; // hoặc req.file.filename tùy bạn muốn lưu gì
    }

    const result = await DiscountService.createDiscount(data);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};


// Cập nhật khuyến mãi
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.updateDiscount(id, req.body);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Xóa khuyến mãi
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.deleteDiscount(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy chi tiết khuyến mãi
const getDetailsDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.getDetailsDiscount(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy tất cả khuyến mãi
const getAllDiscount = async (req, res) => {
  try {
    const { limit = 10, page = 0, sort, filter } = req.query;
    // sort: ["asc", "discountValue"], filter: ["discountName", "Summer"]
    const parsedSort = sort ? JSON.parse(sort) : null;
    const parsedFilter = filter ? JSON.parse(filter) : null;
    const result = await DiscountService.getAllDiscount(
      parseInt(limit),
      parseInt(page),
      parsedSort,
      parsedFilter
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Kiểm tra mã giảm giá hợp lệ
const validateDiscount = async (req, res) => {
  try {
    const { code } = req.query;
    const result = await DiscountService.validateDiscount(code);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Bật/tắt trạng thái khuyến mãi
const toggleDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.toggleDiscountStatus(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy danh sách sản phẩm có khuyến mãi mạnh nhất
const getProductsWithBestDiscount = async (req, res) => {
  try {
    const result = await DiscountService.getProductsWithBestDiscount();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
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
  getProductsWithBestDiscount,
};
