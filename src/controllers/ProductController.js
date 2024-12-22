const Product = require("../models/ProductModel");
const ProductService = require("../services/ProductService");
const uploadCloudinary= require("../Helper/UploadCloudinary")

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  
 
  // Lấy body của request
  const { body } = req;
  console.log("body", body); // In ra đối tượng body
  
  try {
    const {
     // productCode,
      productName,
      productPrice,
      productCategory,
      productSize,
      //productQuantity,
     // productExpiry,
     // productRating,
      productDescription,
    } = req.body;

    if (
      // !productCode ||
       !productName ||
       !productPrice ||
       !req.file||
       !productCategory ||
       !productSize ||
      // !productQuantity ||
      // !productExpiry ||
       !productDescription
     ) 
    
     {
       
       return res.status(400).json({
         status: "ERR",
         message: "All fields are required",
       });
     }
     const productImage= req.file.path;
    
    //console.log("req1233", req.body)
    
    // Kiểm tra input
   

    const newProduct = {
      //productCode,
      productName,
      productPrice,
      productImage,
      productCategory,
      productSize,
      productDescription,
    
     // productQuantity,
     // productExpiry,
    
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
    console.log("ID", productId)
    if (!productId) {
      return res.status(200).json({
        status: "ERR",
        message: "The productId is required",
      });
      
    }
    // const imagePublicId = product.productImage.split("/").pop().split(".")[0]; // Assuming image URL follows Cloudinary format
    // await cloudinary.uploader.destroy(imagePublicId);
    // console.log("IMG", imagePublicId)
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
      Number(limit),
      Number(page) ,
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
