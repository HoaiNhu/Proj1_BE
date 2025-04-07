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
  app.use("/api/recommendation", Recommendation);
};

module.exports = routes;
