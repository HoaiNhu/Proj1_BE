//chứa tất cả router của API
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CityRouter = require("./CityRouter");
const CategoryRouter = require("./CategoryRouter");
const StatusRouter = require("./StatusRouter");


const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/city", CityRouter);
  app.use("/api/category", CategoryRouter);
  app.use("/api/status", StatusRouter);

};

module.exports = routes;
