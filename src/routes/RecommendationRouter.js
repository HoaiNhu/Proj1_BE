const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/RecommendationController");

router.post("/recommend", recommendationController.getRecommendations);
router.post("/interaction/log", recommendationController.logInteraction);
router.post("/recommend/quiz", recommendationController.getQuizRecommendations);

module.exports = router;
