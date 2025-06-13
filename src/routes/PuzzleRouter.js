const express = require("express");
const router = express.Router();
const {
  getDailyPuzzle,
  submitAnswer,
  getProductInfo,
} = require("../controllers/PuzzleController");

router.get("/", getDailyPuzzle);
router.post("/submit", submitAnswer);
router.get("/product", getProductInfo);

module.exports = router;
