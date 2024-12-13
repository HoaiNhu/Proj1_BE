const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/CategoryController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create-category",authMiddleware, categoryController.createCategory);
router.put("/update-category/:id", authMiddleware, categoryController.updateCategory);
router.delete("/delete-product/:id", authMiddleware, categoryController.deleteCategory);
router.get("/get-detailcategory/:id", categoryController.getDetailsCategory);
router.get("/get-all-category", categoryController.getAllCategory);

module.exports = router;
