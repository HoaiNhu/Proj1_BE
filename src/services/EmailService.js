const nodemailer = require("nodemailer");
const Order = require("../models/OrderModel");
const Status = require("../models/StatusModel");

/**
 * Email Service - Gửi thông báo về đơn hàng
 * Sử dụng Brevo SMTP (giống AuthService)
 */

// Tạo transporter (reusable)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // false vì dùng STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Format currency VND
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date time
 */
const formatDateTime = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Tạo HTML template cho email xác nhận đơn hàng
 */
const createOrderConfirmationHTML = (order, statusName) => {
  const orderItemsHTML = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product?.name || "Sản phẩm"}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCurrency(item.total)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎂 Avocado Cake Shop</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Cảm ơn bạn đã đặt hàng!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Xin chào ${
                order.shippingAddress.userName
              }! 👋</h2>
              <p style="color: #666; line-height: 1.6;">
                Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
              </p>
              
              <!-- Order Info -->
              <table width="100%" style="margin: 20px 0; background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> <span style="color: #667eea;">${
                      order.orderCode
                    }</span></p>
                    <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: #28a745;">${statusName}</span></p>
                    <p style="margin: 5px 0;"><strong>Ngày đặt:</strong> ${formatDateTime(
                      order.createdAt
                    )}</p>
                    ${
                      order.deliveryDate
                        ? `<p style="margin: 5px 0;"><strong>Ngày giao hàng dự kiến:</strong> ${new Date(
                            order.deliveryDate
                          ).toLocaleDateString("vi-VN")}</p>`
                        : ""
                    }
                    ${
                      order.deliveryTime
                        ? `<p style="margin: 5px 0;"><strong>Giờ giao hàng:</strong> ${order.deliveryTime}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Address -->
              <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background-color: #f9f9f9;">
                <h3 style="margin-top: 0; color: #333;">📍 Địa chỉ giao hàng</h3>
                <p style="margin: 5px 0; color: #666;">${
                  order.shippingAddress.familyName
                } ${order.shippingAddress.userName}</p>
                <p style="margin: 5px 0; color: #666;">📞 ${
                  order.shippingAddress.userPhone
                }</p>
                <p style="margin: 5px 0; color: #666;">📧 ${
                  order.shippingAddress.userEmail
                }</p>
                <p style="margin: 5px 0; color: #666;">
                  ${order.shippingAddress.userAddress || ""}${
    order.shippingAddress.userWard ? ", " + order.shippingAddress.userWard : ""
  }${
    order.shippingAddress.userDistrict
      ? ", " + order.shippingAddress.userDistrict
      : ""
  }${
    order.shippingAddress.userCity ? ", " + order.shippingAddress.userCity : ""
  }
                </p>
              </div>
              
              <!-- Order Items -->
              <h3 style="color: #333; margin-top: 30px;">🛒 Chi tiết đơn hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #667eea; color: white;">
                    <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                    <th style="padding: 12px; text-align: center;">Số lượng</th>
                    <th style="padding: 12px; text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHTML}
                </tbody>
              </table>
              
              <!-- Pricing Summary -->
              <table width="100%" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: right; padding: 5px 0;">Tổng tiền hàng:</td>
                  <td style="text-align: right; padding: 5px 0; width: 150px;"><strong>${formatCurrency(
                    order.totalItemPrice
                  )}</strong></td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px 0;">Phí vận chuyển:</td>
                  <td style="text-align: right; padding: 5px 0;"><strong>${formatCurrency(
                    order.shippingPrice
                  )}</strong></td>
                </tr>
                ${
                  order.coinsUsed > 0
                    ? `
                <tr>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;">Xu đã sử dụng:</td>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;"><strong>-${formatCurrency(
                    order.coinsUsed
                  )}</strong></td>
                </tr>
                `
                    : ""
                }
                ${
                  order.voucherDiscount > 0
                    ? `
                <tr>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;">Giảm giá voucher:</td>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;"><strong>-${formatCurrency(
                    order.voucherDiscount
                  )}</strong></td>
                </tr>
                `
                    : ""
                }
                <tr style="border-top: 2px solid #667eea;">
                  <td style="text-align: right; padding: 10px 0; font-size: 18px;"><strong>Tổng thanh toán:</strong></td>
                  <td style="text-align: right; padding: 10px 0; font-size: 18px; color: #667eea;"><strong>${formatCurrency(
                    order.totalPrice
                  )}</strong></td>
                </tr>
              </table>
              
              ${
                order.orderNote
                  ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>📝 Ghi chú:</strong>
                <p style="margin: 5px 0;">${order.orderNote}</p>
              </div>
              `
                  : ""
              }
              
              <div style="margin-top: 30px; padding: 20px; background-color: #f0f7ff; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">
                  Bạn có thể theo dõi đơn hàng của mình tại website hoặc liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© 2024 Avocado Cake Shop - Bánh thơm ngon, tình yêu trọn vẹn 💚</p>
              <p style="margin: 5px 0;">Email: support@avocadocake.com | Hotline: 1900-xxxx</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Tạo HTML template cho email cập nhật trạng thái
 */
const createOrderStatusUpdateHTML = (order, oldStatusName, newStatusName) => {
  // Icon và màu sắc theo trạng thái
  const statusConfig = {
    PENDING: { icon: "⏳", color: "#ffc107", text: "Đang chờ xử lý" },
    PROCESSING: { icon: "🔄", color: "#17a2b8", text: "Đang xử lý" },
    DELIVERING: { icon: "🚚", color: "#007bff", text: "Đang giao hàng" },
    COMPLETED: { icon: "✅", color: "#28a745", text: "Đã hoàn thành" },
    CANCELLED: { icon: "❌", color: "#dc3545", text: "Đã hủy" },
  };

  const currentStatus = statusConfig[newStatusName] || {
    icon: "📦",
    color: "#666",
    text: newStatusName,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cập nhật đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎂 Avocado Cake Shop</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Cập nhật trạng thái đơn hàng</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Xin chào ${
                order.shippingAddress.userName
              }! 👋</h2>
              
              <!-- Status Update Badge -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px 40px; background-color: ${
                  currentStatus.color
                }; border-radius: 50px; color: white;">
                  <span style="font-size: 32px;">${currentStatus.icon}</span>
                  <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">${
                    currentStatus.text
                  }</p>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; text-align: center; font-size: 16px;">
                Đơn hàng <strong style="color: #667eea;">${
                  order.orderCode
                }</strong> của bạn đã được cập nhật trạng thái!
              </p>
              
              <!-- Order Info -->
              <table width="100%" style="margin: 20px 0; background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> <span style="color: #667eea;">${
                      order.orderCode
                    }</span></p>
                    <p style="margin: 5px 0;"><strong>Trạng thái hiện tại:</strong> <span style="color: ${
                      currentStatus.color
                    }; font-weight: bold;">${currentStatus.text}</span></p>
                    <p style="margin: 5px 0;"><strong>Cập nhật lúc:</strong> ${formatDateTime(
                      new Date()
                    )}</p>
                    <p style="margin: 5px 0;"><strong>Tổng thanh toán:</strong> <span style="color: #667eea; font-weight: bold;">${formatCurrency(
                      order.totalPrice
                    )}</span></p>
                  </td>
                </tr>
              </table>
              
              <!-- Status Timeline -->
              <div style="margin: 30px 0;">
                <h3 style="color: #333;">📍 Tiến trình đơn hàng</h3>
                <div style="border-left: 3px solid #eee; padding-left: 20px; margin-left: 20px;">
                  <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -26px; width: 12px; height: 12px; background-color: ${
                      [
                        "PENDING",
                        "PROCESSING",
                        "DELIVERING",
                        "COMPLETED",
                      ].includes(newStatusName)
                        ? "#28a745"
                        : "#ccc"
                    }; border-radius: 50%;"></div>
                    <strong>Đơn hàng đã tạo</strong>
                    <p style="margin: 5px 0; color: #999; font-size: 14px;">${formatDateTime(
                      order.createdAt
                    )}</p>
                  </div>
                  
                  <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -26px; width: 12px; height: 12px; background-color: ${
                      ["PROCESSING", "DELIVERING", "COMPLETED"].includes(
                        newStatusName
                      )
                        ? "#28a745"
                        : newStatusName === "PENDING"
                        ? "#ffc107"
                        : "#ccc"
                    }; border-radius: 50%;"></div>
                    <strong>Đang xử lý</strong>
                  </div>
                  
                  <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -26px; width: 12px; height: 12px; background-color: ${
                      ["DELIVERING", "COMPLETED"].includes(newStatusName)
                        ? "#28a745"
                        : "#ccc"
                    }; border-radius: 50%;"></div>
                    <strong>Đang giao hàng</strong>
                  </div>
                  
                  <div style="position: relative;">
                    <div style="position: absolute; left: -26px; width: 12px; height: 12px; background-color: ${
                      newStatusName === "COMPLETED" ? "#28a745" : "#ccc"
                    }; border-radius: 50%;"></div>
                    <strong>Đã hoàn thành</strong>
                  </div>
                </div>
              </div>
              
              ${
                newStatusName === "DELIVERING"
                  ? `
              <div style="margin-top: 20px; padding: 20px; background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1976d2;">
                  <strong>🚚 Đơn hàng đang được giao đến bạn!</strong><br/>
                  Vui lòng để ý điện thoại. Shipper sẽ liên hệ với bạn sớm nhất.
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "COMPLETED"
                  ? `
              <div style="margin-top: 20px; padding: 20px; background-color: #d4edda; border-radius: 8px; border-left: 4px solid #28a745; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #155724;">🎉 Cảm ơn bạn đã mua hàng!</h3>
                <p style="margin: 0; color: #155724;">
                  Chúng tôi hy vọng bạn hài lòng với sản phẩm. Đừng quên đánh giá và chia sẻ trải nghiệm của bạn nhé! ⭐⭐⭐⭐⭐
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "CANCELLED"
                  ? `
              <div style="margin-top: 20px; padding: 20px; background-color: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
                <p style="margin: 0; color: #721c24;">
                  <strong>❌ Đơn hàng đã bị hủy</strong><br/>
                  Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi để được hỗ trợ.
                </p>
              </div>
              `
                  : ""
              }
              
              <div style="margin-top: 30px; padding: 20px; background-color: #f0f7ff; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">
                  Có câu hỏi? Liên hệ với chúng tôi qua hotline: <strong>1900-xxxx</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">© 2024 Avocado Cake Shop - Bánh thơm ngon, tình yêu trọn vẹn 💚</p>
              <p style="margin: 5px 0;">Email: support@avocadocake.com | Hotline: 1900-xxxx</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * GỬI EMAIL XÁC NHẬN ĐỢN HÀNG MỚI
 * Gọi sau khi tạo đơn hàng thành công
 */
const sendOrderConfirmationEmail = async (orderId) => {
  try {
    // Lấy thông tin đơn hàng đầy đủ
    const order = await Order.findById(orderId)
      .populate("orderItems.product", "name price images")
      .populate("status");

    if (!order) {
      throw new Error("Order not found");
    }

    const userEmail = order.shippingAddress.userEmail;
    if (!userEmail) {
      throw new Error("User email not found");
    }

    const statusName = order.status?.statusName || "Đang chờ xử lý";

    // Tạo transporter
    const transporter = createTransporter();

    // Tạo email HTML
    const htmlContent = createOrderConfirmationHTML(order, statusName);

    // Cấu hình email
    const mailOptions = {
      from: `"Avocado Cake Shop 🎂" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `✅ Xác nhận đơn hàng ${order.orderCode} - Avocado Cake Shop`,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email xác nhận đơn hàng đã gửi đến ${userEmail}:`,
      info.messageId
    );

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
    // Không throw error để không ảnh hưởng đến flow tạo đơn hàng
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * GỬI EMAIL CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
 * Gọi sau khi cập nhật trạng thái đơn hàng
 */
const sendOrderStatusUpdateEmail = async (
  orderId,
  oldStatusCode,
  newStatusCode
) => {
  try {
    // Lấy thông tin đơn hàng đầy đủ
    const order = await Order.findById(orderId)
      .populate("orderItems.product", "name price images")
      .populate("status");

    if (!order) {
      throw new Error("Order not found");
    }

    const userEmail = order.shippingAddress.userEmail;
    if (!userEmail) {
      throw new Error("User email not found");
    }

    // Lấy tên trạng thái cũ và mới
    const oldStatus = await Status.findOne({ statusCode: oldStatusCode });
    const newStatus = await Status.findOne({ statusCode: newStatusCode });

    const oldStatusName = oldStatus?.statusName || oldStatusCode;
    const newStatusName = newStatus?.statusName || newStatusCode;

    // Tạo transporter
    const transporter = createTransporter();

    // Tạo email HTML
    const htmlContent = createOrderStatusUpdateHTML(
      order,
      oldStatusName,
      newStatusCode
    );

    // Cấu hình email
    const mailOptions = {
      from: `"Avocado Cake Shop 🎂" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `🔔 Cập nhật đơn hàng ${order.orderCode} - ${newStatusName}`,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email cập nhật trạng thái đã gửi đến ${userEmail}:`,
      info.messageId
    );

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending order status update email:", error);
    // Không throw error để không ảnh hưởng đến flow cập nhật
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
