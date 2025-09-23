const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const SearchHistoryController = require("../controllers/SearchHistoryController");
const { authUserTokenMiddleware } = require("../middleware/authMiddleware");

// Validation middleware
const validateSaveSearchHistory = [
  body("query")
    .trim()
    .notEmpty()
    .withMessage("Query không được để trống")
    .isLength({ min: 1, max: 200 })
    .withMessage("Query phải có độ dài từ 1 đến 200 ký tự"),
];

const validateObjectId = [
  param("id").isMongoId().withMessage("ID không hợp lệ"),
];

const validateLimit = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit phải là số nguyên từ 1 đến 50"),
];

const validateSuggestionsQuery = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Query không được để trống")
    .isLength({ min: 1, max: 100 })
    .withMessage("Query phải có độ dài từ 1 đến 100 ký tự"),
];

const validatePopularLimit = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Limit phải là số nguyên từ 1 đến 20"),
];

const validateSuggestionsLimit = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Limit phải là số nguyên từ 1 đến 10"),
];

// Routes
router.post(
  "/save",
  authUserTokenMiddleware,
  validateSaveSearchHistory,
  SearchHistoryController.saveSearchHistory
);
router.get(
  "/get-history",
  authUserTokenMiddleware,
  validateLimit,
  SearchHistoryController.getSearchHistory
);
router.get(
  "/popular",
  validatePopularLimit,
  SearchHistoryController.getPopularSearches
);
router.get(
  "/suggestions",
  authUserTokenMiddleware,
  validateSuggestionsQuery,
  validateSuggestionsLimit,
  SearchHistoryController.getSearchSuggestions
);
router.delete(
  "/clear",
  authUserTokenMiddleware,
  SearchHistoryController.clearAllSearchHistory
);
router.delete(
  "/delete/:id",
  authUserTokenMiddleware,
  validateObjectId,
  SearchHistoryController.deleteSearchHistory
);

module.exports = router;
