# 📧 Hệ Thống Email Thông Báo Đơn Hàng

## 🎯 Tổng Quan

Hệ thống tự động gửi email thông báo cho khách hàng khi:

1. **Đơn hàng mới được tạo** - Email xác nhận đơn hàng
2. **Trạng thái đơn hàng thay đổi** - Email cập nhật tiến trình

---

## 🚀 Tính Năng

### ✅ Email Xác Nhận Đơn Hàng (Order Confirmation)

**Khi nào gửi:**

- Ngay sau khi đơn hàng được tạo thành công trong `OrderService.createOrder()`

**Nội dung email bao gồm:**

- 🎂 Header với logo và lời cảm ơn
- 📦 Thông tin đơn hàng: Mã đơn, trạng thái, ngày đặt
- 📍 Địa chỉ giao hàng đầy đủ
- 🛒 Chi tiết sản phẩm trong đơn (bảng đẹp)
- 💰 Tổng tiền, phí ship, giảm giá (xu + voucher)
- 📝 Ghi chú đơn hàng (nếu có)
- 💬 Thông tin liên hệ hỗ trợ

### 🔔 Email Cập Nhật Trạng Thái (Status Update)

**Khi nào gửi:**

- Mỗi khi admin cập nhật trạng thái đơn hàng trong `OrderService.updateOrderStatus()`

**Nội dung email bao gồm:**

- 🔄 Badge trạng thái hiện tại với màu sắc & icon
- 📍 Timeline tiến trình đơn hàng (visual)
- 📦 Thông tin tóm tắt đơn hàng
- 🚚 Thông báo đặc biệt theo trạng thái:
  - `DELIVERING`: Nhắc khách để ý điện thoại
  - `COMPLETED`: Lời cảm ơn + yêu cầu đánh giá
  - `CANCELLED`: Thông báo hủy + hỗ trợ

---

## 🎨 Trạng Thái & Biểu Tượng

| Trạng Thái   | Icon | Màu Sắc                   | Mô Tả          |
| ------------ | ---- | ------------------------- | -------------- |
| `PENDING`    | ⏳   | #ffc107 (Vàng)            | Đang chờ xử lý |
| `PROCESSING` | 🔄   | #17a2b8 (Xanh dương nhạt) | Đang xử lý     |
| `DELIVERING` | 🚚   | #007bff (Xanh dương)      | Đang giao hàng |
| `COMPLETED`  | ✅   | #28a745 (Xanh lá)         | Đã hoàn thành  |
| `CANCELLED`  | ❌   | #dc3545 (Đỏ)              | Đã hủy         |

---

## ⚙️ Cấu Hình

### 1️⃣ Cấu Hình Email trong `.env`

```env
# Email Configuration (Brevo SMTP)
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_password
EMAIL_FROM=noreply@avocadocake.com
```

**Lấy SMTP credentials từ Brevo:**

1. Đăng ký tài khoản tại [Brevo.com](https://www.brevo.com)
2. Vào **Settings** → **SMTP & API**
3. Copy **SMTP Login** → `EMAIL_USER`
4. Tạo **SMTP Key** → `EMAIL_PASS`

### 2️⃣ Test Email Locally

```bash
# Test gửi email xác nhận đơn hàng
node -e "
const EmailService = require('./src/services/EmailService');
const orderId = '6756xxxxxxxxxxxx'; // Thay bằng orderId thật
EmailService.sendOrderConfirmationEmail(orderId)
  .then(console.log)
  .catch(console.error);
"

# Test gửi email cập nhật trạng thái
node -e "
const EmailService = require('./src/services/EmailService');
const orderId = '6756xxxxxxxxxxxx';
EmailService.sendOrderStatusUpdateEmail(orderId, 'PENDING', 'DELIVERING')
  .then(console.log)
  .catch(console.error);
"
```

---

## 🔧 File Cấu Trúc

```
Proj1_BE/
├── src/
│   ├── services/
│   │   ├── EmailService.js           ✨ Service gửi email
│   │   └── OrderService.js           🔄 Tích hợp gửi email
│   ├── controllers/
│   │   └── OrderController.js        📡 API endpoint
│   └── models/
│       ├── OrderModel.js             📦 Schema đơn hàng
│       └── StatusModel.js            🏷️ Schema trạng thái
```

---

## 📝 API Flow

### Tạo Đơn Hàng

```javascript
// POST /api/order/create
{
  "orderItems": [...],
  "shippingAddress": {
    "familyName": "Nguyễn",
    "userName": "Văn A",
    "userEmail": "nguyenvana@gmail.com", // ✅ Email để gửi
    "userPhone": "0901234567",
    "userAddress": "123 Đường ABC",
    ...
  },
  ...
}

// Response + Email được gửi tự động
```

### Cập Nhật Trạng Thái

```javascript
// PUT /api/order/update-status/:id
{
  "statusId": "675xxxxxxxxxxxxxx" // ObjectId của Status mới
}

// Response + Email được gửi tự động
```

---

## 🎯 Xử Lý Lỗi

**Nguyên tắc:**

- Email **KHÔNG được** làm fail việc tạo/cập nhật đơn hàng
- Lỗi email chỉ được log ra console, không throw error

```javascript
try {
  await EmailService.sendOrderConfirmationEmail(orderId);
} catch (emailError) {
  console.error("⚠️ Không thể gửi email:", emailError.message);
  // ✅ Đơn hàng vẫn được tạo thành công
}
```

---

## 🧪 Testing Checklist

### ✅ Kiểm tra Email Xác Nhận Đơn Hàng

- [ ] Email gửi thành công sau khi tạo đơn hàng
- [ ] Hiển thị đầy đủ thông tin sản phẩm
- [ ] Tính toán đúng tổng tiền (bao gồm ship, xu, voucher)
- [ ] Địa chỉ giao hàng hiển thị đầy đủ
- [ ] Ghi chú đơn hàng (nếu có) hiển thị đúng
- [ ] Email responsive trên mobile

### ✅ Kiểm tra Email Cập Nhật Trạng Thái

- [ ] Email gửi khi admin thay đổi trạng thái
- [ ] Badge trạng thái hiển thị đúng màu & icon
- [ ] Timeline cập nhật theo trạng thái
- [ ] Thông báo đặc biệt xuất hiện đúng lúc:
  - DELIVERING: Nhắc để ý điện thoại
  - COMPLETED: Yêu cầu đánh giá
  - CANCELLED: Thông báo hủy
- [ ] Email responsive trên mobile

### ✅ Kiểm tra Xử Lý Lỗi

- [ ] Tạo đơn hàng thành công ngay cả khi email fail
- [ ] Cập nhật trạng thái thành công ngay cả khi email fail
- [ ] Log lỗi email ra console
- [ ] Không hiển thị lỗi email cho user

---

## 🌟 Tính Năng Nâng Cao (Tương Lai)

### 🔮 Có Thể Thêm Sau

1. **📊 Email Template Admin Panel**

   - Cho phép admin tùy chỉnh template email
   - Preview email trước khi gửi

2. **📱 SMS Notification**

   - Gửi SMS cho đơn hàng quan trọng
   - Tích hợp với Twilio/AWS SNS

3. **🔔 Push Notification**

   - Real-time notification qua Socket.IO
   - Web Push API cho PWA

4. **📈 Email Analytics**

   - Track email open rate
   - Track click-through rate
   - A/B testing email template

5. **🎨 Dynamic Template**
   - Template theo dịp lễ (Noel, Tết...)
   - Personalization (tên khách, lịch sử mua hàng)

---

## 🐛 Troubleshooting

### ❌ Email không gửi được

**Kiểm tra:**

1. `.env` có cấu hình đầy đủ `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`?
2. Brevo SMTP credentials còn hợp lệ?
3. Console có log lỗi gì?

```bash
# Test connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

### ❌ Email gửi nhưng không nhận được

1. Kiểm tra **Spam folder**
2. Kiểm tra email khách hàng có đúng không
3. Verify email domain trong Brevo

### ❌ Email bị format lỗi

1. Kiểm tra dữ liệu `order` có đầy đủ không
2. Test với email client khác nhau (Gmail, Outlook...)
3. Validate HTML qua [HTML Email Check](https://www.htmlemailcheck.com/)

---

## 📚 Tài Liệu Tham Khảo

- [Nodemailer Documentation](https://nodemailer.com/)
- [Brevo SMTP Setup](https://help.brevo.com/hc/en-us/articles/209467485)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding-html-emails/)

---

## 👨‍💻 Developer Notes

**Tác giả:** GitHub Copilot  
**Ngày tạo:** November 28, 2025  
**Version:** 1.0.0

**Tech Stack:**

- Nodemailer v6.10.0
- Brevo SMTP (smtp-relay.brevo.com)
- Mongoose populated queries
- HTML Email Templates

---

## 🎉 Tóm Tắt

✅ **Đã triển khai:**

- Email xác nhận đơn hàng tự động
- Email cập nhật trạng thái tự động
- HTML template đẹp & responsive
- Error handling không ảnh hưởng business logic

🚀 **Ready to use!** Chỉ cần config `.env` và test thôi!
