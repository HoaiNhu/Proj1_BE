const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRouter = require("../src/routes/AuthRouter");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron"); // Thêm node-cron
const axios = require("axios"); // Thêm axios để self-ping
const Product = require("./models/ProductModel"); // Thêm model Product
const DailyPuzzle = require("./models/DailyPuzzle"); // Thêm model DailyPuzzle
const { generatePuzzle } = require("./utils/PuzzleGenerator"); // Thêm hàm generatePuzzle

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

console.log("Runtime:", {
  node: process.version,
  env: process.env.NODE_ENV || "development",
});

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

// Ping endpoint để keep service alive (prevent Render free tier sleep)
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Pong! Service is alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Cho phép cấu hình CORS qua biến env CORS_ORIGINS (phân cách bằng dấu phẩy)
// VD: CORS_ORIGINS=https://fe.example.com,https://www.example.com
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  "https://avocado-app.onrender.com,http://localhost:3000,http://localhost:3100,http://localhost:8000,https://rcm-system.onrender.com,https://fe-project-avocado-cake.vercel.app,https://rcm-price.onrender.com,https://rcm-recipe-3.onrender.com,https://6ce629c97445.ngrok-free.app"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như mobile apps hoặc curl)
      if (!origin) return callback(null, true);
      if (
        ALLOWED_ORIGINS.includes(origin) ||
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

// Chỉ serve static FE nếu thư mục build tồn tại (triển khai tách FE/BE sẽ bỏ qua)
const clientBuildPath = path.join(__dirname, "../client/build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log("Serving static FE from:", clientBuildPath);
} else {
  console.log("No client build found. Skipping static serving.");
}

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

    // Self-ping mỗi 5 phút để keep service alive (Render free tier)
    // Chỉ chạy trong production
    if (process.env.NODE_ENV === "production") {
      const SERVICE_URL =
        process.env.RENDER_EXTERNAL_URL ||
        "https://avocado-backend.onrender.com";

      cron.schedule("*/5 * * * *", async () => {
        try {
          const response = await axios.get(`${SERVICE_URL}/ping`);
          console.log(
            `✅ Self-ping successful at ${new Date().toISOString()}: ${
              response.data.message
            }`
          );
        } catch (err) {
          console.error(
            `❌ Self-ping failed at ${new Date().toISOString()}:`,
            err.message
          );
        }
      });

      console.log("🔄 Self-ping cron job started (every 5 minutes)");
    }
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Service is running in port: ", +port);
});
