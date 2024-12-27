const Payment = require("../models/PaymentModel");
const Order = require("../models/OrderModel");

//tạo Payment
const createPayment = (newPayment) => {
  return new Promise(async (resolve, reject) => {
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
    } = newPayment;

    try {
      // Kiểm tra `orderId` có tồn tại
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        return resolve({
          status: "ERR",
          message: "Order not found",
        });
      }

      // Tạo `paymentCode` tự động

      const createdPayment = await Payment.create({
        paymentCode,
        paymentName,
        paymentMethod,
        userBank,
        userBankNumber,
        // adminBank,
        // adminBankNumber,
        // adminBankImage,
        orderId,
      });

      if (createdPayment) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdPayment,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update Payment
const updatePayment = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkPayment = await Payment.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu Payment ko tồn tại
      if (checkPayment === null) {
        resolve({
          status: "OK",
          message: "The Payment is not defined",
        });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedPayment", updatedPayment);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedPayment,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete Payment
const deletePayment = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check Payment created
      const checkPayment = await Payment.findOne({
        _id: id,
      });
      //console.log("checkPayment", checkPayment);

      //nếu Payment ko tồn tại
      if (checkPayment === null) {
        resolve({
          status: "OK",
          message: "The Payment is not defined",
        });
      }

      await Payment.findByIdAndDelete(id);
      //console.log("updatedPayment", updatedPayment);
      resolve({
        status: "OK",
        message: "DELETE Payment IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get details Payment
const getDetailsPayment = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const Payment = await Payment.findOne({
        _id: id,
      });

      //nếu Payment ko tồn tại
      if (Payment === null) {
        resolve({
          status: "OK",
          message: "The Payment is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: Payment,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get all Payment
const getAllPayment = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalPayment = await Payment.countDocuments();

      if (filter) {
        const label = filter[0];
        const allPaymentFilter = await Payment.find({
          [label]: { $regex: filter[1] },
        })
          .limit(limit)
          .skip(page * limit); //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Payment IS SUCCESS",
          data: allPaymentFilter,
          total: totalPayment,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalPayment / limit),
        });
      }

      if (sort) {
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allPaymentSort = await Payment.find()
          .limit(limit)
          .skip(page * limit)
          .sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Payment IS SUCCESS",
          data: allPaymentSort,
          total: totalPayment,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalPayment / limit),
        });
      }

      const allPayment = await Payment.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Payment IS SUCCESS",
        data: allPayment,
        total: totalPayment,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalPayment / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createPayment,
  updatePayment,
  deletePayment,
  getDetailsPayment,
  getAllPayment,
};
