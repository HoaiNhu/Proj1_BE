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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🥑 Avocado Cake Shop</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Cảm ơn bạn đã đặt hàng!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="color: #3a060e; margin-top: 0; font-size: 24px; font-weight: 600;">Xin chào ${
                order.shippingAddress.userName
              }! 👋</h2>
              <p style="color: #3a060e; line-height: 1.7; font-size: 15px; opacity: 0.85;">
                Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
              </p>
              
              <!-- Order Info -->
              <table width="100%" style="margin: 25px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; border: 2px solid #27a30020;">
                <tr>
                  <td>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Mã đơn hàng:</strong> <span style="color: #27a300; font-weight: 600;">${
                      order.orderCode
                    }</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Trạng thái:</strong> <span style="color: #27a300; font-weight: 600;">${statusName}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Ngày đặt:</strong> <span style="color: #3a060e; opacity: 0.85;">${formatDateTime(
                      order.createdAt
                    )}</span></p>
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
              <div style="margin: 25px 0; padding: 20px; border-left: 5px solid #27a300; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px;">
                <h3 style="margin-top: 0; color: #3a060e; font-size: 18px; font-weight: 600;">📍 Địa chỉ giao hàng</h3>
                <p style="margin: 8px 0; color: #3a060e; opacity: 0.85; font-size: 15px;">${
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
              <h3 style="color: #3a060e; margin-top: 35px; font-size: 20px; font-weight: 600;">🛒 Chi tiết đơn hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #27a30030; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); color: white;">
                    <th style="padding: 15px 12px; text-align: left; font-weight: 600;">Sản phẩm</th>
                    <th style="padding: 15px 12px; text-align: center; font-weight: 600;">Số lượng</th>
                    <th style="padding: 15px 12px; text-align: right; font-weight: 600;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHTML}
                </tbody>
              </table>
              
              <!-- Pricing Summary -->
              <table width="100%" style="margin-top: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 15px; border-radius: 10px;">
                <tr>
                  <td style="text-align: right; padding: 8px 0; color: #3a060e; font-size: 15px;">Tổng tiền hàng:</td>
                  <td style="text-align: right; padding: 8px 0; width: 150px; color: #3a060e;"><strong style="font-size: 15px;">${formatCurrency(
                    order.totalItemPrice
                  )}</strong></td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 8px 0; color: #3a060e; font-size: 15px;">Phí vận chuyển:</td>
                  <td style="text-align: right; padding: 8px 0; color: #3a060e;"><strong style="font-size: 15px;">${formatCurrency(
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
                <tr style="border-top: 3px solid #27a300;">
                  <td style="text-align: right; padding: 15px 0; font-size: 19px; color: #3a060e;"><strong style="font-weight: 700;">Tổng thanh toán:</strong></td>
                  <td style="text-align: right; padding: 15px 0; font-size: 19px; color: #27a300;"><strong style="font-weight: 700;">${formatCurrency(
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
              
              <div style="margin-top: 35px; padding: 25px; background: linear-gradient(135deg, #27a30010 0%, #27a30020 100%); border-radius: 12px; text-align: center; border: 1px solid #27a30030;">
                <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.6; opacity: 0.9;">
                  Bạn có thể theo dõi đơn hàng của mình tại website hoặc liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #3a060e 0%, #2a0409 100%); padding: 25px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">© 2024 Avocado Cake Shop - Bánh thơm ngon, tình yêu trọn vẹn 💚</p>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.75); font-size: 12px;">Email: support@avocadocake.com | Hotline: 1900-xxxx</p>
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
  // Icon và màu sắc theo trạng thái - ĐẦY ĐỦ TẤT CẢ CÁC TRẠNG THÁI
  const statusConfig = {
    RECEIVED: {
      icon: "📦",
      color: "#17a2b8",
      text: "Đã nhận",
      description:
        "Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận thanh toán.",
    },
    PAID: {
      icon: "💳",
      color: "#27a300",
      text: "Đã thanh toán",
      description: "Thanh toán thành công! Đơn hàng đang được chuẩn bị.",
    },
    PREPARING: {
      icon: "👨‍🍳",
      color: "#fd7e14",
      text: "Đang chuẩn bị",
      description:
        "Chúng tôi đang chuẩn bị đơn hàng của bạn một cách cẩn thận nhất.",
    },
    SHIPPING: {
      icon: "🚚",
      color: "#007bff",
      text: "Đang vận chuyển",
      description:
        "Đơn hàng đang trên đường giao đến bạn. Vui lòng để ý điện thoại!",
    },
    DELIVERED: {
      icon: "✅",
      color: "#28a745",
      text: "Đã giao",
      description: "Đơn hàng đã được giao thành công! Cảm ơn bạn đã mua hàng.",
    },
    CANCELLED: {
      icon: "❌",
      color: "#dc3545",
      text: "Đã hủy",
      description:
        "Đơn hàng đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.",
    },
    // Các trạng thái cũ (để tương thích ngược)
    PENDING: {
      icon: "⏳",
      color: "#ffc107",
      text: "Đang chờ xử lý",
      description: "Đơn hàng đang chờ xử lý.",
    },
    PROCESSING: {
      icon: "🔄",
      color: "#17a2b8",
      text: "Đang xử lý",
      description: "Đơn hàng đang được xử lý.",
    },
    DELIVERING: {
      icon: "🚚",
      color: "#007bff",
      text: "Đang giao hàng",
      description: "Đơn hàng đang được giao đến bạn.",
    },
    COMPLETED: {
      icon: "✅",
      color: "#28a745",
      text: "Đã hoàn thành",
      description: "Đơn hàng đã hoàn thành.",
    },
  };

  const currentStatus = statusConfig[newStatusName] || {
    icon: "📦",
    color: "#27a300",
    text: newStatusName,
    description: "Trạng thái đơn hàng đã được cập nhật.",
  };

  // Timeline steps cho đơn hàng
  const timelineSteps = [
    {
      code: "RECEIVED",
      label: "Đã nhận đơn",
      isActive: [
        "RECEIVED",
        "PAID",
        "PREPARING",
        "SHIPPING",
        "DELIVERED",
      ].includes(newStatusName),
    },
    {
      code: "PAID",
      label: "Đã thanh toán",
      isActive: ["PAID", "PREPARING", "SHIPPING", "DELIVERED"].includes(
        newStatusName
      ),
    },
    {
      code: "PREPARING",
      label: "Đang chuẩn bị",
      isActive: ["PREPARING", "SHIPPING", "DELIVERED"].includes(newStatusName),
    },
    {
      code: "SHIPPING",
      label: "Đang vận chuyển",
      isActive: ["SHIPPING", "DELIVERED"].includes(newStatusName),
    },
    {
      code: "DELIVERED",
      label: "Đã giao hàng",
      isActive: ["DELIVERED"].includes(newStatusName),
    },
  ];

  const timelineHTML = timelineSteps
    .map(
      (step, index) => `
    <div style="position: relative; margin-bottom: ${
      index < timelineSteps.length - 1 ? "25px" : "0"
    };">
      <div style="position: absolute; left: -28px; top: 2px; width: 16px; height: 16px; background-color: ${
        step.isActive
          ? "#27a300"
          : step.code === newStatusName
          ? currentStatus.color
          : "#d1d5db"
      }; border-radius: 50%; border: 3px solid ${
        step.isActive ? "#ffffff" : "#e5e7eb"
      }; box-shadow: 0 0 0 3px ${
        step.isActive ? "#27a30030" : "#e5e7eb50"
      };"></div>
      <strong style="color: ${
        step.isActive ? "#3a060e" : "#9ca3af"
      }; font-size: 15px;">${step.label}</strong>
      ${
        step.code === newStatusName && step.isActive
          ? `
        <p style="margin: 5px 0 0 0; color: #27a300; font-size: 13px; font-weight: 600;">● Đang ở bước này</p>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cập nhật đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🥑 Avocado Cake Shop</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Cập nhật trạng thái đơn hàng</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="color: #3a060e; margin-top: 0; font-size: 24px; font-weight: 600;">Xin chào ${
                order.shippingAddress.userName
              }! 👋</h2>
              
              <!-- Status Update Badge -->
              <div style="text-align: center; margin: 35px 0;">
                <div style="display: inline-block; padding: 30px 50px; background: linear-gradient(135deg, ${
                  currentStatus.color
                } 0%, ${
    currentStatus.color
  }dd 100%); border-radius: 20px; box-shadow: 0 8px 20px ${
    currentStatus.color
  }30;">
                  <span style="font-size: 48px; display: block; margin-bottom: 10px;">${
                    currentStatus.icon
                  }</span>
                  <p style="margin: 0; font-size: 22px; font-weight: 700; color: white; letter-spacing: 0.5px;">${
                    currentStatus.text
                  }</p>
                </div>
              </div>
              
              <p style="color: #3a060e; line-height: 1.7; text-align: center; font-size: 15px; opacity: 0.85; margin: 0 0 10px 0;">
                ${currentStatus.description}
              </p>
              <p style="color: #27a300; line-height: 1.7; text-align: center; font-size: 15px; font-weight: 600; margin: 0 0 30px 0;">
                Mã đơn hàng: <strong>${order.orderCode}</strong>
              </p>
              
              <!-- Order Info -->
              <table width="100%" style="margin: 25px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; border: 2px solid #27a30020;">
                <tr>
                  <td>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Mã đơn hàng:</strong> <span style="color: #27a300; font-weight: 600;">${
                      order.orderCode
                    }</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Trạng thái:</strong> <span style="color: ${
                      currentStatus.color
                    }; font-weight: 700;">${currentStatus.text}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Cập nhật lúc:</strong> <span style="color: #3a060e; opacity: 0.85;">${formatDateTime(
                      new Date()
                    )}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Tổng thanh toán:</strong> <span style="color: #27a300; font-weight: 700; font-size: 16px;">${formatCurrency(
                      order.totalPrice
                    )}</span></p>
                  </td>
                </tr>
              </table>
              
              <!-- Status Timeline -->
              ${
                newStatusName !== "CANCELLED"
                  ? `
              <div style="margin: 35px 0;">
                <h3 style="color: #3a060e; font-size: 20px; font-weight: 600; margin-bottom: 25px;">📍 Tiến trình đơn hàng</h3>
                <div style="border-left: 4px solid #e5e7eb; padding-left: 25px; margin-left: 20px;">
                  ${timelineHTML}
                </div>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "SHIPPING" || newStatusName === "DELIVERING"
                  ? `
              <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; border-left: 5px solid #2196f3;">
                <p style="margin: 0; color: #1565c0; font-size: 15px; line-height: 1.7;">
                  <strong style="font-size: 16px;">🚚 Đơn hàng đang được giao đến bạn!</strong><br/>
                  Vui lòng để ý điện thoại. Shipper sẽ liên hệ với bạn sớm nhất. Dự kiến giao hàng trong 1-2 ngày.
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "DELIVERED" || newStatusName === "COMPLETED"
                  ? `
              <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px; border-left: 5px solid #28a745; text-align: center;">
                <h3 style="margin: 0 0 12px 0; color: #155724; font-size: 20px; font-weight: 700;">🎉 Cảm ơn bạn đã mua hàng!</h3>
                <p style="margin: 0; color: #155724; font-size: 15px; line-height: 1.7;">
                  Chúng tôi hy vọng bạn hài lòng với sản phẩm. Đừng quên đánh giá và chia sẻ trải nghiệm của bạn nhé! ⭐⭐⭐⭐⭐
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "CANCELLED"
                  ? `
              <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border-radius: 12px; border-left: 5px solid #dc3545;">
                <p style="margin: 0; color: #721c24; font-size: 15px; line-height: 1.7;">
                  <strong style="font-size: 16px;">❌ Đơn hàng đã bị hủy</strong><br/>
                  Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi để được hỗ trợ. Chúng tôi luôn sẵn sàng giúp đỡ bạn!
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "PAID"
                  ? `
              <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px; border-left: 5px solid #27a300;">
                <p style="margin: 0; color: #155724; font-size: 15px; line-height: 1.7;">
                  <strong style="font-size: 16px;">💳 Thanh toán thành công!</strong><br/>
                  Chúng tôi đã nhận được thanh toán của bạn. Đơn hàng sẽ được chuẩn bị và giao sớm nhất có thể.
                </p>
              </div>
              `
                  : ""
              }
              
              ${
                newStatusName === "PREPARING"
                  ? `
              <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 12px; border-left: 5px solid #fd7e14;">
                <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.7;">
                  <strong style="font-size: 16px;">👨‍🍳 Đang chuẩn bị đơn hàng!</strong><br/>
                  Đội ngũ của chúng tôi đang chuẩn bị đơn hàng với sự tỉ mỉ nhất. Sắp đến tay bạn rồi!
                </p>
              </div>
              `
                  : ""
              }
              
              <div style="margin-top: 35px; padding: 25px; background: linear-gradient(135deg, #27a30010 0%, #27a30020 100%); border-radius: 12px; text-align: center; border: 1px solid #27a30030;">
                <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.7; opacity: 0.9;">
                  Có câu hỏi? Liên hệ với chúng tôi qua<br/>
                  <strong style="color: #27a300; font-size: 16px;">Hotline: 1900-xxxx</strong> hoặc <strong style="color: #27a300;">support@avocadocake.com</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #3a060e 0%, #2a0409 100%); padding: 25px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">© 2024 Avocado Cake Shop - Bánh thơm ngon, tình yêu trọn vẹn 💚</p>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.75); font-size: 12px;">Email: support@avocadocake.com | Hotline: 1900-xxxx</p>
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

/**
 * GỬI EMAIL THÔNG BÁO THĂNG HẠNG
 * Gọi khi user thăng hạng
 */
const sendRankUpEmail = async (userEmail, data) => {
  try {
    const {
      userName,
      rankName,
      discountPercent,
      benefits,
      voucherCode,
      voucherDiscount,
      voucherExpiry,
    } = data;

    // Tạo transporter
    const transporter = createTransporter();

    const benefitsHTML = benefits
      .map((benefit) => `<li style="margin: 8px 0;">${benefit}</li>`)
      .join("");

    // Tạo email HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chúc mừng thăng hạng</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Chúc mừng!</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 18px;">Bạn đã thăng hạng thành công!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333; margin-top: 0;">Xin chào ${userName}! 👋</h2>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 50px; border-radius: 20px;">
                  <p style="margin: 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Hạng mới của bạn</p>
                  <h1 style="margin: 10px 0; color: #FFD700; font-size: 36px;">${rankName}</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px;">Giảm giá ${discountPercent}%</p>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; text-align: center; font-size: 16px;">
                Cảm ơn bạn đã đồng hành cùng Avocado Cake Shop!<br/>
                Với hạng <strong>${rankName}</strong>, bạn sẽ được hưởng nhiều đặc quyền hơn.
              </p>
              
              <!-- Benefits -->
              <div style="margin: 30px 0; padding: 25px; background-color: #f9f9f9; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #333;">🎁 Đặc quyền của bạn:</h3>
                <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                  ${benefitsHTML}
                </ul>
              </div>
              
              ${
                voucherCode
                  ? `
              <!-- Voucher Gift -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #ffffff;">🎟️ Quà tặng đặc biệt</h3>
                <div style="background: white; padding: 20px; border-radius: 8px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">Mã voucher</p>
                  <h2 style="margin: 8px 0; font-family: 'Courier New', monospace; letter-spacing: 3px; color: #667eea;">${voucherCode}</h2>
                  <p style="margin: 0; font-size: 14px; color: #28a745; font-weight: bold;">Giảm thêm ${voucherDiscount}%</p>
                </div>
                <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 13px;">
                  Hiệu lực đến: ${new Date(voucherExpiry).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
              `
                  : ""
              }
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/rank-benefits" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
                  Xem chi tiết hạng thành viên
                </a>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #f0f7ff; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666; line-height: 1.6;">
                  Tiếp tục mua sắm để duy trì và nâng cao hạng thành viên của bạn.<br/>
                  Mỗi đơn hàng đều được tích lũy vào tổng chi tiêu!
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

    // Cấu hình email
    const mailOptions = {
      from: `"Avocado Cake Shop 🎂" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `🎉 Chúc mừng! Bạn đã thăng hạng ${rankName} - Avocado Cake Shop`,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email thăng hạng đã gửi đến ${userEmail}:`, info.messageId);

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending rank up email:", error);
    // Không throw error để không ảnh hưởng đến flow thăng hạng
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * GỬI EMAIL SAU KHI THANH TOÁN THÀNH CÔNG
 * Gọi từ PaymentResultPage sau khi xác nhận thanh toán thành công
 */
const sendPaymentSuccessEmail = async (orderId) => {
  try {
    console.log(
      `📧 Preparing to send payment success email for order: ${orderId}`
    );

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

    // Tạo transporter
    const transporter = createTransporter();

    // Tạo email HTML cho thanh toán thành công
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanh toán thành công</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Thanh toán thành công!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Cảm ơn bạn đã tin tưởng Avocado Cake Shop</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="color: #3a060e; margin-top: 0; font-size: 24px; font-weight: 600;">Xin chào ${
                order.shippingAddress.userName
              }! 👋</h2>
              
              <p style="color: #3a060e; line-height: 1.7; font-size: 15px; opacity: 0.85; margin-bottom: 25px;">
                Chúng tôi đã nhận được thanh toán của bạn. Đơn hàng sẽ được chuẩn bị và giao đến bạn sớm nhất có thể!
              </p>
              
              <!-- Payment Success Box -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 25px 40px; background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); border-radius: 15px; box-shadow: 0 6px 15px #27a30030;">
                  <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Tổng thanh toán</p>
                  <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">${formatCurrency(
                    order.totalPrice
                  )}</h2>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">💳 Đã thanh toán</p>
                </div>
              </div>
              
              <!-- Order Info -->
              <table width="100%" style="margin: 25px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; border: 2px solid #27a30020;">
                <tr>
                  <td>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Mã đơn hàng:</strong> <span style="color: #27a300; font-weight: 600;">${
                      order.orderCode
                    }</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Ngày thanh toán:</strong> <span style="color: #3a060e; opacity: 0.85;">${formatDateTime(
                      new Date()
                    )}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #3a060e;">Phương thức:</strong> <span style="color: #3a060e; opacity: 0.85;">${
                      order.paymentMethod || "VNPay"
                    }</span></p>
                  </td>
                </tr>
              </table>
              
              <!-- What's Next -->
              <div style="margin: 30px 0;">
                <h3 style="color: #3a060e; font-size: 18px; font-weight: 600; margin-bottom: 20px;">📋 Tiếp theo sẽ diễn ra gì?</h3>
                <div style="border-left: 4px solid #27a300; padding-left: 20px; margin-bottom: 15px;">
                  <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.7;">
                    <strong>1. Xác nhận đơn hàng</strong><br/>
                    <span style="opacity: 0.75;">Chúng tôi đang kiểm tra và xác nhận đơn hàng của bạn</span>
                  </p>
                </div>
                <div style="border-left: 4px solid #27a300; padding-left: 20px; margin-bottom: 15px;">
                  <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.7;">
                    <strong>2. Chuẩn bị sản phẩm</strong><br/>
                    <span style="opacity: 0.75;">Đội ngũ của chúng tôi sẽ chuẩn bị sản phẩm cẩn thận</span>
                  </p>
                </div>
                <div style="border-left: 4px solid #27a300; padding-left: 20px;">
                  <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.7;">
                    <strong>3. Giao hàng</strong><br/>
                    <span style="opacity: 0.75;">Đơn hàng sẽ được giao đến địa chỉ của bạn</span>
                  </p>
                </div>
              </div>
              
              <!-- Shipping Info -->
              <div style="margin: 25px 0; padding: 20px; border-left: 5px solid #27a300; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px;">
                <h3 style="margin-top: 0; color: #3a060e; font-size: 18px; font-weight: 600;">📍 Địa chỉ giao hàng</h3>
                <p style="margin: 8px 0; color: #3a060e; opacity: 0.85; font-size: 15px;">${
                  order.shippingAddress.familyName
                } ${order.shippingAddress.userName}</p>
                <p style="margin: 8px 0; color: #3a060e; opacity: 0.85; font-size: 15px;">📞 ${
                  order.shippingAddress.userPhone
                }</p>
                <p style="margin: 8px 0; color: #3a060e; opacity: 0.85; font-size: 15px;">
                  ${order.shippingAddress.userAddress || ""}${
      order.shippingAddress.userWard
        ? ", " + order.shippingAddress.userWard
        : ""
    }${
      order.shippingAddress.userDistrict
        ? ", " + order.shippingAddress.userDistrict
        : ""
    }${
      order.shippingAddress.userCity
        ? ", " + order.shippingAddress.userCity
        : ""
    }
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/order-detail-history/${order._id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #27a300 0%, #1e7d00 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 10px #27a30030;">
                  Xem chi tiết đơn hàng
                </a>
              </div>
              
              <div style="margin-top: 35px; padding: 25px; background: linear-gradient(135deg, #27a30010 0%, #27a30020 100%); border-radius: 12px; text-align: center; border: 1px solid #27a30030;">
                <p style="margin: 0; color: #3a060e; font-size: 15px; line-height: 1.7; opacity: 0.9;">
                  Bạn sẽ nhận được email thông báo khi đơn hàng có cập nhật mới.<br/>
                  Có thắc mắc? Liên hệ: <strong style="color: #27a300;">1900-xxxx</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #3a060e 0%, #2a0409 100%); padding: 25px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">© 2024 Avocado Cake Shop - Bánh thơm ngon, tình yêu trọn vẹn 💚</p>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.75); font-size: 12px;">Email: support@avocadocake.com | Hotline: 1900-xxxx</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Cấu hình email
    const mailOptions = {
      from: `"Avocado Cake Shop 🥑" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `✅ Thanh toán thành công - Đơn hàng ${order.orderCode}`,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email thanh toán thành công đã gửi đến ${userEmail}:`,
      info.messageId
    );

    return {
      success: true,
      message: "Payment success email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending payment success email:", error);
    // Không throw error để không ảnh hưởng đến flow thanh toán
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendRankUpEmail,
  sendPaymentSuccessEmail, // ✅ Export function mới
};
