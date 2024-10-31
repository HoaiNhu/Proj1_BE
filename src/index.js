const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 5501;

app.get("/", (req, res) => {
  res.send("Hello world one");
});
app.use(bodyParser.json());
routes(app);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect db successful");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Service is running in port: ", +port);
});
