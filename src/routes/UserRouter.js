const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.put("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", authMiddleware, userController.deleteUser); //xoá user
router.get("/getAll", authMiddleware, userController.getAllUser); //lấy info user cho admin
router.get("/get-details/:id", authUserMiddleware, userController.getDetailsUser); //lấy info user cho user
router.post("/refresh-token", userController.refreshToken); //cấp access token mới sau khi token cũ hết hạn dựa vào refresh token

module.exports = router;
