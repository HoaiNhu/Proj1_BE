const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware")
const multer= require("multer");
const upload = multer();
const uploadCloudinary= require("../Helper/UploadCloudinary")

router.post("/create-product",authMiddleware,uploadCloudinary.single('productImage'), productController.createProduct);
router.put("/update-product/:id",authMiddleware, productController.updateProduct);
router.delete("/delete-product/:id", productController.deleteProduct);
router.get("/get-detail-product/:id", productController.getDetailsProduct);
router.get("/get-all-product", productController.getAllProduct);
module.exports = router;
