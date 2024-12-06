const NewsService = require("../services/NewsService");
const Joi = require("joi");

// Helper function: Handle errors
const handleError = (res, error) => {
  return res.status(500).json({
    status: "ERR",
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

// Helper function: Validate params
const validateId = (id) => {
  return Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .validate(id);
};

// Create News
const createNews = async (req, res) => {
  const schema = Joi.object({
    newsCode: Joi.string().required(),
    newsName: Joi.string().required(),
    newsTitle: Joi.string().required(),
    newsContent: Joi.string().required(),
    newsImage: Joi.string().uri().required(),
    newsCategory: Joi.string().required(),
    newsAuthor: Joi.string().required(),
    isActive: Joi.boolean().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.details[0].message,
    });
  }

  try {
    const response = await NewsService.createNews(value);
    return res.status(201).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

// Update News
const updateNews = async (req, res) => {
  const { error: idError } = validateId(req.params.id);
  if (idError) {
    return res.status(400).json({
      status: "ERR",
      message: "Invalid newsId",
    });
  }

  const schema = Joi.object({
    newsCode: Joi.string().optional(),
    newsName: Joi.string().optional(),
    newsTitle: Joi.string().optional(),
    newsContent: Joi.string().optional(),
    newsImage: Joi.string().uri().optional(),
    newsCategory: Joi.string().optional(),
    newsAuthor: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.details[0].message,
    });
  }

  try {
    const response = await NewsService.updateNews(req.params.id, value);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "News not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

// Delete News
const deleteNews = async (req, res) => {
  const { error: idError } = validateId(req.params.id);
  if (idError) {
    return res.status(400).json({
      status: "ERR",
      message: "Invalid newsId",
    });
  }

  try {
    const response = await NewsService.deleteNews(req.params.id);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "News not found",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "News deleted successfully",
    });
  } catch (e) {
    return handleError(res, e);
  }
};

// Get Details of a News
const getDetailsNews = async (req, res) => {
  const { error: idError } = validateId(req.params.id);
  if (idError) {
    return res.status(400).json({
      status: "ERR",
      message: "Invalid newsId",
    });
  }

  try {
    const response = await NewsService.getDetailsNews(req.params.id);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "News not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

// Get All News
const getAllNews = async (req, res) => {
  const schema = Joi.object({
    limit: Joi.number().min(1).max(100).default(10),
    page: Joi.number().min(0).default(0),
    sort: Joi.string().optional(),
    filter: Joi.string().optional(),
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.details[0].message,
    });
  }

  try {
    const response = await NewsService.getAllNews(
      value.limit,
      value.page,
      value.sort,
      value.filter
    );

    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

// Check News Status
const checkNewsStatus = async (req, res) => {
  const { error: idError } = validateId(req.params.id);
  if (idError) {
    return res.status(400).json({
      status: "ERR",
      message: "Invalid newsId",
    });
  }

  try {
    const response = await NewsService.checkNewsStatus(req.params.id);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "News not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

// Update News Status
const updateStatusNews = async (req, res) => {
  // Validate ID in params
  const idValidationSchema = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required();
  const { error: idError } = idValidationSchema.validate(req.params.id);
  if (idError) {
    return res.status(400).json({
      status: "ERR",
      message: "Invalid newsId",
    });
  }

  // Validate status in body
  const statusSchema = Joi.object({
    isActive: Joi.boolean().required(),
  });
  const { error, value } = statusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.details[0].message,
    });
  }

  try {
    // Update status in the database
    const response = await NewsService.updateStatus(
      req.params.id,
      value.isActive
    );
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "News not found",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "News status updated successfully",
      data: response,
    });
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  getDetailsNews,
  getAllNews,
  checkNewsStatus,
  updateStatusNews,
};
