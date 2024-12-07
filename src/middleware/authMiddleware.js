const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Middleware xác thực cho admin
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res.status(401).json({
      status: "ERR",
      message: "Access token is missing",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "Invalid or expired access token",
      });
    }

    // Kiểm tra quyền admin
    if (decoded.payload?.isAdmin) {
      console.log("Admin authentication successful");
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        message: "You are not authorized to perform this action",
      });
    }
  });
};

// Middleware xác thực cho user lấy thông tin cá nhân
const authUserMiddleware = (req, res, next) => {
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res.status(401).json({
      status: "ERR",
      message: "Access token is missing",
    });
  }

  const token = authHeader.split(" ")[1];
  const userId = req.params.id;

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "Invalid or expired access token",
      });
    }

    // Kiểm tra quyền admin hoặc user truy cập đúng tài khoản của mình
    if (decoded.payload?.isAdmin || decoded.payload?.id === userId) {
      console.log("User authentication successful");
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        message: "You are not authorized to access this resource",
      });
    }
  });
};

module.exports = {
  authMiddleware,
  authUserMiddleware,
};
