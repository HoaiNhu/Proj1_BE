const CategoryService = require("../services/CategoryService");

// Tạo sản phẩm mới
const createCategory = async (req, res) => {
  try {
    const {
      categoryCode,
      categoryName,
      description,
    } = req.body;

    // Kiểm tra input
    if (
      !categoryCode ||
      !categoryName ||
      !description
    ) {
      return res.status(200).json({
        status: "ERR",
        message: "All fields are required",
      });
    }

    const newCategory = {
      categoryCode,
      categoryName,
      description,
    };

    const response = await CategoryService.createCategory(newCategory);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Cập nhật thông tin sản phẩm
const updateCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;
    const data = req.body;

    if (!CategoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "The CategoryId is required",
      });
    }

    const response = await CategoryService.updateCategory(CategoryId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Xóa sản phẩm
const deleteCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;

    if (!CategoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "The CategoryId is required",
      });
    }

    const response = await CategoryService.deleteCategory(CategoryId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy thông tin chi tiết sản phẩm
const getDetailsCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;

    if (!CategoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "The CategoryId is required",
      });
    }

    const response = await CategoryService.getDetailsCategory(CategoryId);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "Category not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy danh sách tất cả sản phẩm
const getAllCategory = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;

    const response = await CategoryService.getAllCategory(
      Number(limit) || 10,
      Number(page) || 0,
      sort,
      filter
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getDetailsCategory,
  getAllCategory,
};
