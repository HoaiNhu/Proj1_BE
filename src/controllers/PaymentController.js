const PaymentService = require("../services/PaymentService");

//create Payment
const createPayment = async (req, res) => {
  try {
    //test input data
    const {
      paymentCode,
      paymentName,
      paymentMethod,
      userBank,
      userBankNumber,
      // adminBank,
      // adminBankNumber,
      // adminBankImage,
      orderId,
    } = req.body;
    //console.log("req.body", req.body);

    if (!userBank || !userBankNumber || !orderId) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    const response = await PaymentService.createPayment(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//update Payment
const updatePayment = async (req, res) => {
  try {
    const PaymentId = req.params.id;
    const data = req.body;
    if (!PaymentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The PaymentId is required",
      });
    }

    const response = await PaymentService.updatePayment(PaymentId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//delete Payment
const deletePayment = async (req, res) => {
  try {
    const PaymentId = req.params.id;
    //const token = req.headers;

    if (!PaymentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The PaymentId is required",
      });
    }

    const response = await PaymentService.deletePayment(PaymentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get details Payment
const getDetailsPayment = async (req, res) => {
  try {
    const PaymentId = req.params.id;

    if (!PaymentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The PaymentId is required",
      });
    }

    const response = await PaymentService.getDetailsPayment(PaymentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get all Payment
const getAllPayment = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    const response = await PaymentService.getAllPayment(
      Number(limit) || 8,
      Number(page) || 0,
      sort,
      filter
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createPayment,
  updatePayment,
  deletePayment,
  getDetailsPayment,
  getAllPayment,
};
