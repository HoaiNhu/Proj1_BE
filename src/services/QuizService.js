const Quiz = require("../models/QuizModel");
const UserQuizResponse = require("../models/UserQuizResponseModel");
const { v4: uuidv4 } = require("uuid");

class QuizService {
  // Tạo dữ liệu mẫu nếu chưa có
  async createSampleData() {
    try {
      const count = await Quiz.countDocuments();
      if (count === 0) {
        const sampleQuizzes = [
          {
            question: "Bạn đang cảm thấy thế nào?",
            type: "mood",
            options: [
              { text: "Vui vẻ", value: "happy" },
              { text: "Buồn bã", value: "sad" },
              { text: "Căng thẳng", value: "stressed" },
              { text: "Khác", value: "custom" },
            ],
            allowCustomAnswer: true,
            order: 1,
          },
          {
            question: "Bạn nhớ đến hương vị gì từ thời thơ ấu?",
            type: "memory",
            options: [
              { text: "Vị sữa tươi", value: "milk" },
              { text: "Hương vani", value: "vanilla" },
              { text: "Vị chocolate", value: "chocolate" },
              { text: "Khác", value: "custom" },
            ],
            allowCustomAnswer: true,
            order: 2,
          },
          {
            question: "Bạn thích loại bánh nào nhất?",
            type: "preference",
            options: [
              { text: "Bánh ngọt", value: "sweet" },
              { text: "Bánh mặn", value: "savory" },
              { text: "Bánh trái cây", value: "fruit" },
              { text: "Khác", value: "custom" },
            ],
            allowCustomAnswer: true,
            order: 3,
          },
        ];

        await Quiz.insertMany(sampleQuizzes);
        console.log("Sample quiz data created");
      }
    } catch (error) {
      console.error("Error creating sample data:", error);
    }
  }

  // Lấy danh sách câu hỏi
  async getQuizzes() {
    try {
      // Tạo dữ liệu mẫu nếu chưa có
      await this.createSampleData();

      const quizzes = await Quiz.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();
      return quizzes;
    } catch (error) {
      throw new Error("Error fetching quizzes: " + error.message);
    }
  }

  // Lưu câu trả lời của user
  async saveUserResponse(userId, quizId, answer, customAnswer = null) {
    try {
      // Tạo sessionId mới nếu chưa có
      const lastResponse = await UserQuizResponse.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean();

      const sessionId = lastResponse?.sessionId || uuidv4();

      const response = new UserQuizResponse({
        userId,
        quizId,
        answer,
        customAnswer,
        sessionId,
      });

      await response.save();
      return response;
    } catch (error) {
      throw new Error("Error saving user response: " + error.message);
    }
  }

  // Lưu nhiều câu trả lời cùng lúc
  async saveMultipleResponses(userId, responses) {
    try {
      console.log("QuizService - saveMultipleResponses");
      console.log("userId:", userId);
      console.log("responses:", responses);

      const sessionId = uuidv4();
      const responseDocs = responses.map((response) => {
        console.log("Processing response:", response);
        return {
          userId,
          quizId: response.questionId, // Sửa từ quizId thành questionId
          answer: response.answer,
          customAnswer: response.customAnswer,
          sessionId,
          completed: true,
        };
      });

      console.log("Response docs to save:", responseDocs);

      const savedResponses = await UserQuizResponse.insertMany(responseDocs);
      return savedResponses;
    } catch (error) {
      console.error("Error in QuizService.saveMultipleResponses:", error);
      console.error("Error stack:", error.stack);
      throw new Error("Error saving multiple responses: " + error.message);
    }
  }

  // Lấy lịch sử quiz của user
  async getUserQuizHistory(userId) {
    try {
      const responses = await UserQuizResponse.find({ userId })
        .populate("quizId")
        .sort({ createdAt: -1 })
        .lean();

      // Nhóm theo sessionId
      const groupedResponses = responses.reduce((acc, response) => {
        if (!acc[response.sessionId]) {
          acc[response.sessionId] = {
            sessionId: response.sessionId,
            createdAt: response.createdAt,
            responses: [],
          };
        }
        acc[response.sessionId].responses.push(response);
        return acc;
      }, {});

      return Object.values(groupedResponses);
    } catch (error) {
      throw new Error("Error fetching user quiz history: " + error.message);
    }
  }

  // Admin: Tạo câu hỏi mới
  async createQuiz(quizData) {
    try {
      const quiz = new Quiz(quizData);
      await quiz.save();
      return quiz;
    } catch (error) {
      throw new Error("Error creating quiz: " + error.message);
    }
  }

  // Admin: Cập nhật câu hỏi
  async updateQuiz(quizId, updateData) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { $set: updateData },
        { new: true }
      );
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      return quiz;
    } catch (error) {
      throw new Error("Error updating quiz: " + error.message);
    }
  }

  // Admin: Xóa câu hỏi (soft delete)
  async deleteQuiz(quizId) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { isActive: false },
        { new: true }
      );
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      return quiz;
    } catch (error) {
      throw new Error("Error deleting quiz: " + error.message);
    }
  }
}

module.exports = new QuizService();
