const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath); // Đảm bảo đường dẫn tới thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    // Đặt tên file với timestamp để tránh trùng lặp
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Kiểm tra file hợp lệ (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Chấp nhận file
  } else {
    cb(new Error("Chỉ hỗ trợ upload các định dạng ảnh (JPEG, PNG, GIF, WEBP)")); // Từ chối file không hợp lệ
  }
};

// Khởi tạo middleware upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn kích thước file: 2MB
  fileFilter: fileFilter,
});

module.exports = upload;
