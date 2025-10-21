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

// Health check endpoint for monitoring
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Avocado Cake Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như mobile apps hoặc curl)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://avocado-app.onrender.com", // Production frontend
        "http://localhost:3000", // Local development
        "http://localhost:3100", // Local development alternative
      ];

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
// });

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
