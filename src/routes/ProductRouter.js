const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Thư mục lưu file
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    },
  });
  const upload = multer({ storage });

  
router.post("/create-product", upload.single("productImage"), productController.createProduct);
router.put("/update-product/:id", productController.updateProduct);
router.delete("/delete-product/:id", productController.deleteProduct);
router.get("/get-detail-product/:id", productController.getDetailsProduct);
router.get("/get-all-product", productController.getAllProduct);

module.exports = router;
