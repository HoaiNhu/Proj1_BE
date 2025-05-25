const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/UserModel");
dotenv.config();

// Middleware xác thực cho admin
const authMiddleware = (req, res, next) => {
  //console.log("req", req);
  const authHeader = req.headers.token;
  //console.log("AUTH", authHeader);
  if (!authHeader) {
    return res.status(401).json({
      status: "ERR",
      message: "Access token is missing",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        message: "Invalid or expired access token",
      });
    }

    // Kiểm tra quyền admin
    if (user?.isAdmin) {
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
  // console.log("req.headers", req.headers);

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
    if (decoded?.isAdmin || decoded.id === userId) {
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

// Middleware xác thực cho user thông thường
const authUserTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "ERR",
        message: "Không tìm thấy token",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        status: "ERR",
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Lấy thông tin user từ database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "ERR",
        message: "Không tìm thấy người dùng",
      });
    }

    // Gán thông tin user vào request
    req.user = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (e) {
    return res.status(401).json({
      status: "ERR",
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = {
  authMiddleware,
  authUserMiddleware,
  authUserTokenMiddleware,
};
