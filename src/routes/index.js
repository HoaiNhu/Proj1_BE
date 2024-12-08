//chứa tất cả router của API
const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CityRouter = require("./CityRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/city", CityRouter);
};

module.exports = routes;
