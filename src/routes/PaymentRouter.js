const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");

router.post("/create-payment", PaymentController.createPayment);
router.post("/create-qr-payment", PaymentController.createQrPayment);
router.get(
  "/get-detail-payment/:paymentCode",
  PaymentController.getDetailPayment
);

module.exports = router;
