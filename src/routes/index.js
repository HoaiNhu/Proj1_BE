//chứa tất cả router của API
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CityRouter = require("./CityRouter");
const CategoryRouter = require("./CategoryRouter");
const StatusRouter = require("./StatusRouter");
const NewsRouter = require("./NewsRouter");
const OrderRouter = require("./OrderRouter");
const PaymentRouter = require("./PaymentRouter");
const DiscountRouter = require("./DiscountRouter");
const Recommendation = require("./RecommendationRouter");
const Rating = require("./RatingRouter");
const AIRouter = require("./AIRouter");
const ChatbotRouter = require("./ChatbotRouter");
const QuizRouter = require("./QuizRouter");
const PuzzleRouter = require("./PuzzleRouter");
const UserAssetsRouter = require("./UserAssetsRouter");
const SearchHistoryRouter = require("./SearchHistoryRouter");
const VoucherRouter = require("./VoucherRouter");
const RankRouter = require("./RankRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/city", CityRouter);
  app.use("/api/category", CategoryRouter);
  app.use("/api/status", StatusRouter);
  app.use("/api/news", NewsRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/payment", PaymentRouter);
  app.use("/api/discount", DiscountRouter);
  app.use("/api/voucher", VoucherRouter);
  app.use("/api/recommendation", Recommendation);
  app.use("/api/rating", Rating);
  app.use("/api/ai", AIRouter);
  app.use("/api/chatbot", ChatbotRouter);
  app.use("/api/quiz", QuizRouter);
  app.use("/api/puzzle", PuzzleRouter);
  app.use("/api/user-assets", UserAssetsRouter);
  app.use("/api/search-history", SearchHistoryRouter);
  app.use("/api/rank", RankRouter);
};

module.exports = routes;
