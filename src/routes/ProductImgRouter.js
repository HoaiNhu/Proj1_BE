const express = require("express");
const router = express.Router();
const productImageController = require("../controllers/productImageController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create-productImage",authMiddleware,  productImageController.createProductImg);
router.put("/update-productImage/:id",authMiddleware, productImageController.updateproductImage);
router.delete("/delete-productImage/:id", productImageController.deleteproductImage);
router.get("/get-detail-productImage/:id", productImageController.getDetailsproductImage);
router.get("/get-all-productImage", productImageController.getAllproductImage);

module.exports = router;
