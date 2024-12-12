const CategoryService = require("../services/CategoryService");

//create Category
const createCategory = async (req, res) => {
  try {
    //test input data
    const { code,name,description } =
      req.body;
    //console.log("req.body", req.body);

    if (!name ) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    const response = await CategoryService.createCategory(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: "Name is require",
    });
  }
};

//update Category
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
    return res.status(404).json({
      message: e,
    });
  }
};

//delete Category
const deleteCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;
    //const token = req.headers;

    if (!CategoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "The CategoryId is required",
      });
    }

    const response = await CategoryService.deleteCategory(CategoryId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get details Category
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
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get all Category
const getAllCategory = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    const response = await CategoryService.getAllCategory(Number(limit) || 8, Number(page) || 0, sort, filter);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
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
