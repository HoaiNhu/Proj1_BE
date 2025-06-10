const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/QuizController");
const {
  authUserTokenMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", QuizController.getQuizzes);
router.post(
  "/response",
  authUserTokenMiddleware,
  QuizController.saveUserResponse
);
router.post(
  "/responses",
  authUserTokenMiddleware,
  QuizController.saveMultipleResponses
);
router.get(
  "/history",
  authUserTokenMiddleware,
  QuizController.getUserQuizHistory
);

router.post(
  "/recommend/quiz",
  authUserTokenMiddleware,
  QuizController.getQuizRecommendations
);

// Admin routes
router.post("/", authMiddleware, QuizController.createQuiz);
router.put("/:quizId", authMiddleware, QuizController.updateQuiz);
router.delete("/:quizId", authMiddleware, QuizController.deleteQuiz);

module.exports = router;
