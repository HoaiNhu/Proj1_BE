const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/RatingController");
const {
  authUserTokenMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");

// User routes
router.post("/create", authUserTokenMiddleware, ratingController.createRating);
router.put(
  "/update/:ratingId",
  authUserTokenMiddleware,
  ratingController.updateRating
);
router.get("/product/:productId", ratingController.getProductRatings);
router.get(
  "/user/:productId/:orderId",
  authUserTokenMiddleware,
  ratingController.getUserRating
);

// Admin routes
router.get("/admin/all", authMiddleware, ratingController.getAllRatings);
router.delete(
  "/admin/delete/:ratingId",
  authMiddleware,
  ratingController.deleteRating
);
router.patch(
  "/admin/toggle-visibility/:ratingId",
  authMiddleware,
  ratingController.toggleRatingVisibility
);
router.post(
  "/admin/delete-multiple",
  authMiddleware,
  ratingController.deleteMultipleRatings
);

module.exports = router;
