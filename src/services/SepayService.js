const { SePayPgClient } = require("sepay-pg-node");
const Order = require("../models/OrderModel");
const Payment = require("../models/PaymentModel");
const Status = require("../models/StatusModel");

/**
 * Tạo thanh toán Sepay
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @returns {Promise} - Kết quả tạo thanh toán
 */
const createSepayPayment = (paymentData) => {
  return new Promise(async (resolve, reject) => {
    const {
      paymentCode,
      orderId,
      totalPrice,
      sepayPaymentMethod = "BANK_TRANSFER", // BANK_TRANSFER, CARD, NAPAS_BANK_TRANSFER
      customerInfo = {},
    } = paymentData;

    try {
      // Kiểm tra order tồn tại
      const existingOrder = await Order.findById(orderId)
        .populate("orderItems.product")
        .populate("userId");

      if (!existingOrder) {
        return resolve({ status: "ERR", message: "Order not found" });
      }

      // Kiểm tra trạng thái đơn hàng
      if (existingOrder.paymentStatus === "SUCCESS") {
        return resolve({
          status: "ERR",
          message: "Order has already been paid",
        });
      }

      // 🎖️ Áp dụng rank discount nếu chưa có
      let finalTotalPrice = totalPrice;
      if (
        existingOrder.userId &&
        (!existingOrder.rankDiscount || existingOrder.rankDiscount === 0)
      ) {
        try {
          const User = require("../models/UserModel");
          const user = await User.findById(existingOrder.userId).populate(
            "currentRank"
          );
          if (user && user.currentRank && user.currentRank.isActive) {
            const rankDiscountPercent = user.currentRank.discountPercent;
            const rankDiscount =
              (existingOrder.totalItemPrice * rankDiscountPercent) / 100;

            existingOrder.rankDiscount = rankDiscount;
            existingOrder.rankDiscountPercent = rankDiscountPercent;
            existingOrder.totalPrice =
              existingOrder.totalItemPrice -
              rankDiscount +
              existingOrder.shippingPrice -
              (existingOrder.voucherDiscount || 0) -
              (existingOrder.coinsUsed || 0);
            await existingOrder.save();

            finalTotalPrice = existingOrder.totalPrice;
            console.log(
              `🎖️ Áp dụng rank discount ${rankDiscountPercent}% = ${rankDiscount}đ cho Sepay payment`
            );
          }
        } catch (error) {
          console.error("Error applying rank discount:", error);
        }
      } else {
        finalTotalPrice = existingOrder.totalPrice;
      }

      // Kiểm tra biến môi trường
      const SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID;
      const SEPAY_SECRET_KEY = process.env.SEPAY_SECRET_KEY;
      const SEPAY_ENV = process.env.SEPAY_ENV || "sandbox";

      if (!SEPAY_MERCHANT_ID || !SEPAY_SECRET_KEY) {
        console.error("Sepay credentials missing:", {
          SEPAY_MERCHANT_ID: SEPAY_MERCHANT_ID ? "exists" : "missing",
          SEPAY_SECRET_KEY: SEPAY_SECRET_KEY ? "exists" : "missing",
        });
        return resolve({
          status: "ERR",
          message: "Sepay credentials are missing in environment variables",
        });
      }

      // Khởi tạo Sepay client
      const client = new SePayPgClient({
        env: SEPAY_ENV, // 'sandbox' hoặc 'production'
        merchant_id: SEPAY_MERCHANT_ID,
        secret_key: SEPAY_SECRET_KEY,
      });

      // Lấy URLs từ env
      const successUrl =
        process.env.SEPAY_SUCCESS_URL ||
        "http://localhost:3000/payment-result?status=success";
      const errorUrl =
        process.env.SEPAY_ERROR_URL ||
        "http://localhost:3000/payment-result?status=error";
      const cancelUrl =
        process.env.SEPAY_CANCEL_URL ||
        "http://localhost:3000/payment-result?status=cancel";

      // Tạo checkout URL
      const checkoutURL = client.checkout.initCheckoutUrl();

      // Tạo dữ liệu form thanh toán
      const checkoutFormFields = client.checkout.initOneTimePaymentFields({
        operation: "PURCHASE",
        payment_method: sepayPaymentMethod, // 'CARD' | 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER'
        order_invoice_number: paymentCode, // Mã đơn hàng unique
        order_amount: Math.round(finalTotalPrice), // Số tiền (VND)
        currency: "VND",
        order_description: `Thanh toan don hang ${existingOrder._id}`,
        customer_id: customerInfo.userId || existingOrder.userId?.toString(),
        success_url: `${successUrl}&paymentCode=${paymentCode}&orderId=${orderId}`,
        error_url: `${errorUrl}&paymentCode=${paymentCode}&orderId=${orderId}`,
        cancel_url: `${cancelUrl}&paymentCode=${paymentCode}&orderId=${orderId}`,
        custom_data: JSON.stringify({
          orderId: orderId.toString(),
          paymentCode,
          userId: existingOrder.userId?.toString(),
        }),
      });

      console.log("✅ Sepay checkout form created:", {
        checkoutURL,
        paymentCode,
        amount: finalTotalPrice,
        method: sepayPaymentMethod,
      });

      // Tạo payment record
      const createdPayment = await Payment.create({
        paymentCode,
        paymentMethod: "sepay",
        orderId,
        status: "PENDING",
        sepayPaymentMethod,
        paymentUrl: checkoutURL,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: {
          checkoutURL,
          checkoutFormFields,
          paymentCode,
          orderId,
          amount: finalTotalPrice,
        },
      });
    } catch (error) {
      console.error("Error in createSepayPayment:", error);
      reject(error);
    }
  });
};

/**
 * Xử lý callback từ Sepay (success, error, cancel)
 * @param {String} status - Trạng thái callback
 * @param {Object} query - Query params từ callback URL
 * @returns {Promise} - Kết quả xử lý callback
 */
const handleSepayCallback = (status, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { paymentCode, orderId } = query;

      if (!paymentCode || !orderId) {
        return resolve({
          status: "ERR",
          message: "Missing paymentCode or orderId",
        });
      }

      const payment = await Payment.findOne({ paymentCode });
      if (!payment) {
        return resolve({
          status: "ERR",
          message: "Payment not found",
        });
      }

      // Chỉ cập nhật status dựa vào callback
      // Status chính xác sẽ được cập nhật qua IPN webhook
      console.log(
        `📞 Sepay callback received: ${status} for payment ${paymentCode}`
      );

      resolve({
        status: "OK",
        message: `Payment callback received: ${status}`,
        data: {
          paymentCode,
          orderId,
          callbackStatus: status,
          paymentStatus: payment.status,
        },
      });
    } catch (error) {
      console.error("Error in handleSepayCallback:", error);
      reject(error);
    }
  });
};

/**
 * Xử lý IPN webhook từ Sepay
 * @param {Object} ipnData - Dữ liệu IPN từ Sepay
 * @returns {Promise} - Kết quả xử lý IPN
 */
const handleSepayIPN = (ipnData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("🔔 Sepay IPN received:", JSON.stringify(ipnData, null, 2));

      const { notification_type, order, transaction } = ipnData;

      if (!order || !order.order_invoice_number) {
        console.error("❌ Invalid IPN data: missing order information");
        return resolve({
          status: "ERR",
          message: "Invalid IPN data",
        });
      }

      const paymentCode = order.order_invoice_number;

      // Tìm payment record
      const payment = await Payment.findOne({ paymentCode });
      if (!payment) {
        console.error(`❌ Payment not found for code: ${paymentCode}`);
        return resolve({
          status: "ERR",
          message: "Payment not found",
        });
      }

      // Kiểm tra trùng lặp IPN (dựa vào transaction_id)
      if (
        payment.sepayTransactionId &&
        payment.sepayTransactionId === transaction?.id
      ) {
        console.log(
          `⚠️ Duplicate IPN for transaction ${transaction.id}, skipping...`
        );
        return resolve({
          status: "OK",
          message: "IPN already processed",
        });
      }

      // Tìm order để cập nhật
      const existingOrder = await Order.findById(payment.orderId);
      if (!existingOrder) {
        console.error(`❌ Order not found: ${payment.orderId}`);
        return resolve({
          status: "ERR",
          message: "Order not found",
        });
      }

      // Xử lý theo notification_type
      if (notification_type === "ORDER_PAID") {
        // Thanh toán thành công
        payment.status = "SUCCESS";
        payment.sepayOrderId = order.id;
        payment.sepayTransactionId = transaction?.id;
        payment.transId = transaction?.transaction_id;
        payment.sepayData = ipnData;

        // 🎯 Tìm status "PAID" (Đã thanh toán) trong database
        const paidStatus = await Status.findOne({ statusCode: "PAID" });

        existingOrder.paymentStatus = "SUCCESS";
        existingOrder.isPaid = true;
        existingOrder.paidAt = new Date();

        // Cập nhật status đơn hàng sang "PAID" nếu tồn tại
        if (paidStatus) {
          existingOrder.status = paidStatus._id;
          console.log(`🎯 Order status updated to PAID (${paidStatus._id})`);
        } else {
          console.warn(
            `⚠️ PAID status not found in database, keeping current status`
          );
        }

        await payment.save();
        await existingOrder.save();

        console.log(
          `✅ Payment SUCCESS for order ${existingOrder._id}, Sepay transaction ${transaction?.id}`
        );

        // Có thể thêm logic: gửi email, cập nhật inventory, v.v.
      } else if (notification_type === "ORDER_CANCELLED") {
        // Đơn hàng bị hủy
        payment.status = "CANCELLED";
        payment.sepayOrderId = order.id;
        payment.sepayData = ipnData;

        existingOrder.paymentStatus = "CANCELLED";

        await payment.save();
        await existingOrder.save();

        console.log(`⚠️ Payment CANCELLED for order ${existingOrder._id}`);
      } else {
        // Các trường hợp khác
        console.log(
          `ℹ️ Unhandled notification_type: ${notification_type} for payment ${paymentCode}`
        );
        payment.sepayData = ipnData;
        await payment.save();
      }

      resolve({
        status: "OK",
        message: "IPN processed successfully",
        success: true,
      });
    } catch (error) {
      console.error("❌ Error in handleSepayIPN:", error);
      reject(error);
    }
  });
};

/**
 * Lấy chi tiết payment Sepay
 * @param {String} paymentCode - Mã thanh toán
 * @returns {Promise} - Thông tin payment
 */
const getSepayPaymentDetail = (paymentCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payment = await Payment.findOne({
        paymentCode,
        paymentMethod: "sepay",
      });

      if (!payment) {
        return resolve({
          status: "ERR",
          message: "Sepay payment not found",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: payment,
      });
    } catch (error) {
      console.error("Error in getSepayPaymentDetail:", error);
      reject(error);
    }
  });
};

/**
 * Hủy đơn hàng Sepay (chỉ cho QR payment)
 * @param {String} paymentCode - Mã thanh toán
 * @returns {Promise} - Kết quả hủy đơn
 */
const cancelSepayOrder = (paymentCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payment = await Payment.findOne({
        paymentCode,
        paymentMethod: "sepay",
      });

      if (!payment) {
        return resolve({
          status: "ERR",
          message: "Sepay payment not found",
        });
      }

      if (payment.status !== "PENDING") {
        return resolve({
          status: "ERR",
          message: `Cannot cancel payment with status: ${payment.status}`,
        });
      }

      // Khởi tạo Sepay client
      const client = new SePayPgClient({
        env: process.env.SEPAY_ENV || "sandbox",
        merchant_id: process.env.SEPAY_MERCHANT_ID,
        secret_key: process.env.SEPAY_SECRET_KEY,
      });

      // Gọi API hủy đơn hàng
      const response = await client.order.cancel(paymentCode);

      if (response.data) {
        payment.status = "CANCELLED";
        await payment.save();

        // Cập nhật order
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = "CANCELLED";
          await order.save();
        }

        console.log(`✅ Sepay order cancelled: ${paymentCode}`);

        resolve({
          status: "OK",
          message: "Order cancelled successfully",
          data: response.data,
        });
      } else {
        resolve({
          status: "ERR",
          message: "Failed to cancel order",
        });
      }
    } catch (error) {
      console.error("Error in cancelSepayOrder:", error);
      reject(error);
    }
  });
};

module.exports = {
  createSepayPayment,
  handleSepayCallback,
  handleSepayIPN,
  getSepayPaymentDetail,
  cancelSepayOrder,
};
