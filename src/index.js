const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRouter = require("../src/routes/AuthRouter");
const path = require("path");
const cron = require("node-cron"); // Thêm node-cron
const Product = require("./models/ProductModel"); // Thêm model Product
const DailyPuzzle = require("./models/DailyPuzzle"); // Thêm model DailyPuzzle
const { generatePuzzle } = require("./utils/PuzzleGenerator"); // Thêm hàm generatePuzzle

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// app.get("/", (req, res) => {
//   res.send("Hello world one");
// });

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://avocado-app.onrender.com"
        : "http://localhost:3000", // Cho phép cả local và production
    credentials: true, // Cho phép gửi cookie
  })
);

app.use(bodyParser.json());
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ limit: "10000mb", extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../../client/build")));

app.use("/api/auth", authRouter);
routes(app);

// Định tuyến mọi request không phải API về index.html của React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
});

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect db successful");
    // Lên lịch tạo ô chữ mới mỗi ngày lúc 00:00
    cron.schedule("0 0 * * *", async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const existing = await DailyPuzzle.findOne({ date: today });
        if (!existing) {
          const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(10);
          const usedProductIds = await DailyPuzzle.find()
            .sort({ date: -1 })
            .limit(10)
            .select("productId");
          const availableProducts = recentProducts.filter(
            (p) => !usedProductIds.some((id) => id.equals(p._id))
          );
          if (availableProducts.length > 0) {
            const randomProduct =
              availableProducts[
                Math.floor(Math.random() * availableProducts.length)
              ];
            const {
              puzzle,
              answer,
              originalName,
              missingChars,
              hiddenIndices,
            } = generatePuzzle(randomProduct.productName);
            await DailyPuzzle.create({
              date: today,
              productId: randomProduct._id,
              puzzle,
              answer,
              originalProductName: originalName,
              missingChars,
              hiddenIndices,
            });
            console.log(
              `Created puzzle for ${today}: ${puzzle} -> ${originalName}`
            );
          } else {
            console.log("No available products for puzzle.");
          }
        }
      } catch (err) {
        console.error("Error in daily puzzle cron job:", err);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Service is running in port: ", +port);
});
