const ProductService = require("../services/ProductService");

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const {
     // productCode,
      productName,
      productCategory,
      productPrice,
      //productQuantity,
     // productExpiry,
     // productRating,
      productDescription,
    } = req.body;

    const productImage = req.file ? req.file.filename : null;
    // Kiểm tra input
    if (
     // !productCode ||
      !productName ||
      !productImage ||
      !productCategory ||
      !productPrice ||
     // !productQuantity ||
     // !productExpiry ||
      !productDescription
    ) {
      return res.status(400).json({
        status: "ERR",
        message: "All fields are required",
      });
    }

    const newProduct = {
      //productCode,
      productName,
      productImage,
      productCategory,
      productPrice,
     // productQuantity,
     // productExpiry,
      productDescription,
      //productRating: productRating || 0, // Nếu không có, mặc định 0
    };

    const response = await ProductService.createProduct(newProduct);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;

    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
    }

    const response = await ProductService.updateProduct(productId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
    }

    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Something went wrong",
    });
  }
};

// Lấy thông tin chi tiết sản phẩm
const getDetailsProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
    }

    const response = await ProductService.getDetailsProduct(productId);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "Product not found",
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
const getAllProduct = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;

    const response = await ProductService.getAllProduct(
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
  createProduct,
  updateProduct,
  deleteProduct,
  getDetailsProduct,
  getAllProduct,
};
