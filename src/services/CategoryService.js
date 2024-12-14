const Category = require("../models/CategoryModel");
const mongoose = require("mongoose");
/**
 * Create a new Category
 */
const createCategory = (newCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        categoryCode,
        categoryName,
      
      } = newCategory;

      // Check for duplicate CategoryCode or CategoryName
      const checkCategory = await Category.findOne({
        $or: [{ categoryCode }, { categoryName }],
      });

      if (checkCategory) {
        return resolve({
          status: "ERR",
          message: "Category code or name already exists.",
        });
      }

      const createdCategory = await Category.create(newCategory);

      resolve({
        status: "OK",
        message: "Category created successfully",
        data: createdCategory,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to create Category",
      });
    }
  });
};

/**
 * Update an existing Category
 */
const updateCategory = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if Category exists
      const checkCategory = await Category.findById(id);

      if (!checkCategory) {
        return resolve({
          status: "ERR",
          message: "Category not found",
        });
      }

      // Check for duplicate CategoryName (excluding the current Category)
      const duplicateCategory = await Category.findOne({
        categoryName: data.categoryName,
        _id: { $ne: id },
      });

      if (duplicateCategory) {
        return resolve({
          status: "ERR",
          message: "Category name already exists",
        });
      }

      const updatedCategory = await Category.findByIdAndUpdate(id, data, {
        new: true,
      });

      resolve({
        status: "OK",
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to update Category",
      });
    }
  });
};

/**
 * Delete a Category
 */
const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkCategory = await Category.findById(id);

      if (!checkCategory) {
        return resolve({
          status: "ERR",
          message: "Category not found",
        });
      }

      await Category.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "Category deleted successfully",
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to delete Category",
      });
    }
  });
};

/**
 * Get details of a single Category
 */
const getDetailsCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Category = await Category.findById(id).populate("CategoryCategory");

      if (!Category) {
        return resolve({
          status: "ERR",
          message: "Category not found",
        });
      }

      resolve({
        status: "OK",
        message: "Category retrieved successfully",
        data: Category,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to get Category details",
      });
    }
  });
};

/**
 * Get all Categorys with pagination, filtering, and sorting
 */
const getAllCategory = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};

      // Add filtering condition
      if (filter) {
        const [field, value] = filter;
        query[field] = { $regex: value, $options: "i" }; // Case-insensitive partial match
      }

      const totalCategory = await Category.countDocuments(query);

      // Add sorting condition
      const sortCondition = sort ? { [sort[1]]: sort[0] } : {};

      const allCategory = await Category.find(query)
        .limit(limit)
        .skip(page * limit)
        .sort(sortCondition);

      resolve({
        status: "OK",
        message: "Categorys retrieved successfully",
        data: allCategory,
        total: totalCategory,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(totalCategory / limit),
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message || "Failed to get Categorys",
      });
    }
  });
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getDetailsCategory,
  getAllCategory,
};
