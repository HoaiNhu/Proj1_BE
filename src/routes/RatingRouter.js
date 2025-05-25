const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/RatingController");
const { authUserTokenMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authUserTokenMiddleware, ratingController.createRating);
router.get("/product/:productId", ratingController.getProductRatings);
router.get(
  "/user/:productId/:orderId",
  authUserTokenMiddleware,
  ratingController.getUserRating
);

module.exports = router;
