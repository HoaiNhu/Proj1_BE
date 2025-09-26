const Product = require("../models/ProductModel");

/**
 * Create a new product
 */
const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        //  productCode,
        productName,
        productImage,
        productCategory,
        productPrice,
        //productQuantity,
        // productExpiry,
        // productRating,
        productDescription,
      } = newProduct;

      // Check for duplicate productCode or productName
      const checkProduct = await Product.findOne({
        $or: [{ productName }],
      });

      if (checkProduct) {
        return resolve({
          status: "ERR",
          message: "Product name already exists.",
        });
      }

      const createdProduct = await Product.create(newProduct);

      resolve({
        status: "OK",
        message: "Product created successfully",
        data: createdProduct,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to create product",
      });
    }
  });
};

/**
 * Update an existing product
 */
const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if product exists
      const checkProduct = await Product.findById(id);

      if (!checkProduct) {
        return resolve({
          status: "ERR",
          message: "Product not found",
        });
      }

      // Check for duplicate productName (excluding the current product)
      const duplicateProduct = await Product.findOne({
        productName: data.productName,
        _id: { $ne: id },
      });

      if (duplicateProduct) {
        return resolve({
          status: "ERR",
          message: "Product name already exists",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });

      resolve({
        status: "OK",
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to update product",
      });
    }
  });
};

/**
 * Delete a product
 */
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findById(id);

      if (!checkProduct) {
        return resolve({
          status: "ERR",
          message: "Product not found",
        });
      }

      await Product.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "Product deleted successfully",
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to delete product",
      });
    }
  });
};

/**
 * Get details of a single product
 */
const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id)
        .populate("productCategory")
        .lean();

      if (!product) {
        return resolve({
          status: "ERR",
          message: "Product not found",
        });
      }

      if (!product.productDiscount) {
        product.productDiscount = 0;
      }

      // Đảm bảo averageRating và totalRatings luôn có giá trị
      if (!product.averageRating) {
        product.averageRating = 5; // Giá trị mặc định
      }
      if (!product.totalRatings) {
        product.totalRatings = 5; // Giá trị mặc định
      }

      resolve({
        status: "OK",
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to get product details",
      });
    }
  });
};

/**
 * Get all products with pagination, filtering, and sorting
 */
const getAllProduct = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};

      // Add filtering condition
      if (filter) {
        const [field, value] = filter;
        query[field] = { $regex: value, $options: "i" }; // Case-insensitive partial match
      }

      const totalProduct = await Product.countDocuments(query);

      // Add sorting condition
      const sortCondition = sort ? { [sort[1]]: sort[0] } : {};

      const allProduct = await Product.find(query)
        .limit(limit)
        .skip(page * limit)
        .sort(sortCondition);

      resolve({
        status: "OK",
        message: "Products retrieved successfully",
        data: allProduct,
        total: totalProduct,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to get products",
      });
    }
  });
};

/**
 * Search for products by name
 */
const searchProducts = async (query) => {
  try {
    if (!query) {
      throw {
        status: "ERR",
        message: "Search query is required",
      };
    }

    const products = await Product.find({
      productName: { $regex: query, $options: "i" }, // Case-insensitive partial match
    });

    if (products.length === 0) {
      return {
        status: "ERR",
        message: "No matching products found",
      };
    }

    return {
      status: "OK",
      message: "Products retrieved successfully",
      data: products,
    };
  } catch (e) {
    console.error("Error searching products:", e);
    throw {
      status: "ERR",
      message: e.message || "Failed to search products",
    };
  }
};

/**
 * Get products by category
 */
const getProductsByCategory = (categoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!categoryId) {
        return resolve({
          status: "ERR",
          message: "Category ID is required",
        });
      }

      const products = await Product.find({ productCategory: categoryId });

      if (products.length === 0) {
        return resolve({
          status: "ERR",
          message: "No products found for this category",
        });
      }

      resolve({
        status: "OK",
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to get products by category",
      });
    }
  });
};

// get products created in current week (Mon 00:00 to Sun 23:59:59.999)
const getWeeklyNewProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const day = now.getDay(); // 0=Sun,1=Mon,...
      const diffToMonday = (day + 6) % 7; // days since Monday
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - diffToMonday);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const products = await Product.find({
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      }).sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Weekly new users retrieved successfully",
        total: products.length,
        data: products,
        range: { start: startOfWeek, end: endOfWeek },
      });
    } catch (e) {
      reject(e);
    }
  });
};

// get users created in previous week (Mon 00:00 to Sun 23:59:59.999 of last week)
const getPreviousWeekNewProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfThisWeek.setDate(now.getDate() - diffToMonday);

      const startOfPrevWeek = new Date(startOfThisWeek);
      startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);

      const endOfPrevWeek = new Date(startOfPrevWeek);
      endOfPrevWeek.setDate(startOfPrevWeek.getDate() + 6);
      endOfPrevWeek.setHours(23, 59, 59, 999);

      const products = await Product.find({
        createdAt: { $gte: startOfPrevWeek, $lte: endOfPrevWeek },
      }).sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Previous week new users retrieved successfully",
        total: products.length,
        data: products,
        range: { start: startOfPrevWeek, end: endOfPrevWeek },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getDetailsProduct,
  getAllProduct,
  searchProducts,
  getProductsByCategory, // Export the new function
  getWeeklyNewProducts,
  getPreviousWeekNewProducts,
};
