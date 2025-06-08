const QuizService = require("../services/QuizService");

class QuizController {
  // Lấy danh sách câu hỏi
  async getQuizzes(req, res) {
    try {
      const quizzes = await QuizService.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lưu câu trả lời của user
  async saveUserResponse(req, res) {
    try {
      const { quizId, answer, customAnswer } = req.body;
      const userId = req.user.id; // Lấy userId từ middleware
      const response = await QuizService.saveUserResponse(
        userId,
        quizId,
        answer,
        customAnswer
      );
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lưu nhiều câu trả lời cùng lúc
  async saveMultipleResponses(req, res) {
    try {
      console.log("Request body:", req.body);
      console.log("User from token:", req.user);

      const { responses } = req.body;
      const userId = req.user.id;

      console.log("User ID:", userId);
      console.log("Responses:", responses);

      const savedResponses = await QuizService.saveMultipleResponses(
        userId,
        responses
      );
      res.json(savedResponses);
    } catch (error) {
      console.error("Error in saveMultipleResponses:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy lịch sử quiz của user
  async getUserQuizHistory(req, res) {
    try {
      const userId = req.user.id; // Lấy userId từ middleware
      const history = await QuizService.getUserQuizHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Tạo câu hỏi mới
  async createQuiz(req, res) {
    try {
      console.log("Request body:", req.body);
      const quiz = await QuizService.createQuiz(req.body);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Cập nhật câu hỏi
  async updateQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await QuizService.updateQuiz(quizId, req.body);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Xóa câu hỏi
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await QuizService.deleteQuiz(quizId);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new QuizController();
