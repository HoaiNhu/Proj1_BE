const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/OrderModel");
const Payment = require("../models/PaymentModel");

const createPayment = (newPayment) => {
  return new Promise(async (resolve, reject) => {
    const {
      paymentCode,
      userBank,
      userBankNumber,
      paymentMethod,
      orderId,
      totalPrice,
    } = newPayment;
    try {
      const existingOrder = await Order.findById(orderId).populate(
        "orderItems.product"
      );
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

      const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
      const CLIENT_ID = process.env.CLIENT_ID;
      const CLIENT_SECRET = process.env.CLIENT_SECRET;

      // Log chi tiết để debug
      console.log("Environment check:", {
        PAYPAL_API_URL,
        CLIENT_ID_LENGTH: CLIENT_ID ? CLIENT_ID.length : 0,
        CLIENT_SECRET_LENGTH: CLIENT_SECRET ? CLIENT_SECRET.length : 0,
        NODE_ENV: process.env.NODE_ENV,
      });

      if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("PayPal credentials missing:", {
          CLIENT_ID: CLIENT_ID ? "exists" : "missing",
          CLIENT_SECRET: CLIENT_SECRET ? "exists" : "missing",
        });
        return resolve({
          status: "ERR",
          message: "PayPal credentials are missing in environment variables",
        });
      }

      try {
        // Lấy access token
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
          "base64"
        );
        console.log(
          "Attempting to get PayPal access token with auth length:",
          auth.length
        );

        const tokenResponse = await axios.post(
          `${PAYPAL_API_URL}/v1/oauth2/token`,
          "grant_type=client_credentials",
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        console.log("PayPal token response:", tokenResponse.data);
        const accessToken = tokenResponse.data.access_token;

        // Tạo thanh toán PayPal
        console.log("Creating PayPal order...");
        const response = await axios.post(
          `${PAYPAL_API_URL}/v2/checkout/orders`,
          {
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: (totalPrice / 23000).toFixed(2), // Chuyển VND sang USD (tỷ giá giả định)
                },
              },
            ],
            application_context: {
              return_url: "http://localhost:3000/payment-result?status=success",
              cancel_url: "http://localhost:3000/payment-result?status=cancel",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("PayPal order created:", response.data);
        const paymentUrl = response.data.links.find(
          (link) => link.rel === "approve"
        ).href;

        // Tạo payment record
        const createdPayment = await Payment.create({
          paymentCode,
          paymentMethod,
          userBank,
          userBankNumber,
          orderId,
          paymentUrl,
          status: "PENDING",
        });

        resolve({
          status: "OK",
          message: "SUCCESS",
          data: {
            paymentUrl,
            paymentCode,
            orderId,
          },
        });
      } catch (paypalError) {
        console.error("PayPal API Error:", {
          status: paypalError.response?.status,
          data: paypalError.response?.data,
          message: paypalError.message,
          headers: paypalError.response?.headers,
        });
        return resolve({
          status: "ERR",
          message: "Error connecting to PayPal. Please try again later.",
        });
      }
    } catch (e) {
      console.error("Error in createPayment:", e);
      reject(e);
    }
  });
};

const createQrPayment = (newPayment) => {
  return new Promise(async (resolve, reject) => {
    const {
      paymentCode,
      userBank,
      userBankNumber,
      paymentMethod,
      orderId,
      totalPrice,
    } = newPayment;
    try {
      const existingOrder = await Order.findById(orderId).populate(
        "orderItems.product"
      );
      if (!existingOrder) {
        return resolve({ status: "ERR", message: "Order not found" });
      }

      // Tạo nội dung QR
      const adminBankInfo = {
        bank: process.env.BANK_NAME || "VietinBank",
        bin: process.env.BANK_BIN || "970415", // Mã BIN của VietinBank
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || "108874196741",
        accountName: process.env.BANK_ACCOUNT_NAME || "NGUYEN HOAI NHU",
      };

      // Chuẩn bị dữ liệu cho VietQR API
      const qrData = {
        accountNo: adminBankInfo.accountNumber,
        accountName: adminBankInfo.accountName
          .toUpperCase()
          .replace(/[^A-Z\s]/g, ""), // Tiếng Việt không dấu, viết hoa
        acqId: parseInt(adminBankInfo.bin), // Mã BIN dạng số
        amount: totalPrice,
        addInfo: `ORDER${paymentCode}`.substring(0, 25), // Giới hạn 25 ký tự
        // format: "text", // Hoặc "qrDataURL" nếu muốn ảnh
        format: "qrDataURL", // Trả về hình ảnh Data URI
        template: "print", // hiển thị hết thông tin
      };

      // Gọi API VietQR để tạo mã QR
      const vietQrResponse = await axios.post(
        "https://api.vietqr.io/v2/generate",
        qrData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.VIETQR_CLIENT_ID,
            "x-api-key": process.env.VIETQR_API_KEY,
          },
        }
      );

      if (vietQrResponse.data.code !== "00") {
        console.error("VietQR API error:", vietQrResponse.data);
        return resolve({
          status: "ERR",
          message: vietQrResponse.data.desc || "Failed to generate VietQR code",
        });
      }

      const qrCodeUrl = vietQrResponse.data.data.qrDataURL; // URL mã QR
      // const qrCodeContent = vietQrResponse.data.data.qrCode;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

      const createdPayment = await Payment.create({
        paymentCode,
        paymentMethod,
        userBank,
        userBankNumber,
        orderId,
        // qrCodeUrl: qrCodeContent, // Lưu URL hình ảnh QR
        qrCodeUrl, // Lưu URL hình ảnh QR
        status: "PENDING",
        expiresAt,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: {
          // qrCodeUrl: qrCodeContent, // Trả về URL hình ảnh QR
          qrCodeUrl, // Trả về URL hình ảnh QR
          paymentCode,
          expiresAt: expiresAt.toISOString(),
          adminBankInfo,
        },
      });
    } catch (e) {
      console.error("Error in createQrPayment:", e);
      reject(e);
    }
  });
};

const getDetailPayment = (paymentCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payment = await Payment.findOne({ paymentCode });
      if (!payment) {
        return resolve({ status: "ERR", message: "Payment not found" });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: payment,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createPayment,
  createQrPayment,
  getDetailPayment,
};
