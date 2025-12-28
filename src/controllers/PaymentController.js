const PaymentService = require("../services/PaymentService");
const SepayService = require("../services/SepayService");
const EmailService = require("../services/EmailService");

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

    // Thêm headers để tránh cache
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const response = await PaymentService.getDetailPayment(paymentCode);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ============ SEPAY CONTROLLERS ============

/**
 * Tạo thanh toán Sepay
 */
const createSepayPayment = async (req, res) => {
  try {
    const response = await SepayService.createSepayPayment(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Xử lý callback từ Sepay (success/error/cancel)
 */
const handleSepayCallback = async (req, res) => {
  try {
    const { status } = req.params; // 'success', 'error', 'cancel'
    const response = await SepayService.handleSepayCallback(status, req.query);

    // Redirect về frontend với thông tin
    const { paymentCode, orderId } = req.query;

    // Tự động detect frontend URL dựa trên môi trường
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      // Nếu không có env var, dùng logic để detect
      if (process.env.NODE_ENV === "production") {
        // Production - thay YOUR_FRONTEND_DOMAIN bằng domain frontend thật
        frontendUrl = "https://fe-project-avocado-cake.vercel.app";
      } else {
        // Development
        frontendUrl = "http://localhost:3000";
      }
    }

    const redirectUrl = `${frontendUrl}/payment-result?status=${status}&paymentCode=${paymentCode}&orderId=${orderId}`;

    return res.redirect(redirectUrl);
  } catch (e) {
    console.error("Error in handleSepayCallback:", e);
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Xử lý IPN webhook từ Sepay
 */
const handleSepayIPN = async (req, res) => {
  try {
    console.log(" Sepay IPN webhook received");
    const response = await SepayService.handleSepayIPN(req.body);

    // Trả về theo format Sepay yêu cầu
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(" Error in handleSepayIPN:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Lấy chi tiết thanh toán Sepay
 */
const getSepayPaymentDetail = async (req, res) => {
  try {
    const { paymentCode } = req.params;
    const response = await SepayService.getSepayPaymentDetail(paymentCode);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Hủy đơn hàng Sepay
 */
const cancelSepayOrder = async (req, res) => {
  try {
    const { paymentCode } = req.params;
    const response = await SepayService.cancelSepayOrder(paymentCode);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ============ EMAIL NOTIFICATION ============

/**
 * Gửi email sau thanh toán thành công
 * Được gọi từ PaymentResultPage sau khi confirm thanh toán thành công
 */
const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(
      `📧 Request to send payment success email for order: ${orderId}`
    );

    if (!orderId) {
      return res.status(400).json({
        status: "ERR",
        message: "Order ID is required",
      });
    }

    const result = await EmailService.sendPaymentSuccessEmail(orderId);

    if (result.success) {
      return res.status(200).json({
        status: "OK",
        message: "Payment success email sent successfully",
        data: result,
      });
    } else {
      return res.status(500).json({
        status: "ERR",
        message: result.message || "Failed to send email",
      });
    }
  } catch (e) {
    console.error("❌ Error in sendPaymentSuccessEmail controller:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
  createPayment,
  createQrPayment,
  getDetailPayment,
  // Sepay methods
  createSepayPayment,
  handleSepayCallback,
  handleSepayIPN,
  getSepayPaymentDetail,
  cancelSepayOrder,
  // Email notification
  sendPaymentSuccessEmail,
};
