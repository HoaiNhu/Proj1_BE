const PaymentService = require("../services/PaymentService");

const createPayment = async (req, res) => {
  try {
    const response = await PaymentService.createPayment(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const createQrPayment = async (req, res) => {
  try {
    const response = await PaymentService.createQrPayment(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const getDetailPayment = async (req, res) => {
  try {
    const { paymentCode } = req.params;
    const response = await PaymentService.getDetailPayment(paymentCode);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createPayment,
  createQrPayment,
  getDetailPayment,
};
