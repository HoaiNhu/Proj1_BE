# SEPAY PAYMENT INTEGRATION GUIDE

## 📋 Tổng quan

Tài liệu hướng dẫn tích hợp cổng thanh toán **Sepay** vào website AvocadoCake.

**Sepay** là cổng thanh toán online hỗ trợ:

- ✅ Quét mã QR chuyển khoản ngân hàng (VietQR)
- ✅ Thanh toán bằng thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
- ✅ Quét mã QR NAPAS

---

## 🔄 Luồng thanh toán Sepay

```
1. Khách hàng chọn sản phẩm → Tạo đơn hàng
2. Chọn phương thức thanh toán "Sepay"
3. Website tạo form thanh toán với chữ ký bảo mật
4. Chuyển hướng đến cổng thanh toán Sepay
5. Khách hàng thanh toán (QR Banking / Thẻ / NAPAS QR)
6. Sepay xử lý giao dịch
7. Callback về website (success / error / cancel)
8. IPN webhook gửi thông tin giao dịch
9. Cập nhật trạng thái đơn hàng
```

---

## 🛠️ Cài đặt Backend

### 1. Cài đặt package Sepay SDK

```bash
cd Proj1_BE
npm install sepay-pg-node
```

### 2. Cấu hình biến môi trường

Thêm vào file `.env`:

```env
# Sepay Payment Gateway
SEPAY_MERCHANT_ID=your_sepay_merchant_id
SEPAY_SECRET_KEY=your_sepay_secret_key
SEPAY_ENV=sandbox
SEPAY_SUCCESS_URL=http://localhost:3000/payment-result?status=success
SEPAY_ERROR_URL=http://localhost:3000/payment-result?status=error
SEPAY_CANCEL_URL=http://localhost:3000/payment-result?status=cancel
SEPAY_IPN_URL=http://localhost:3001/api/payment/sepay/ipn
```

**Lưu ý:**

- `SEPAY_ENV`: `sandbox` (test) hoặc `production` (thật)
- Lấy `MERCHANT_ID` và `SECRET_KEY` từ [https://my.sepay.vn/](https://my.sepay.vn/)

### 3. Đăng ký tài khoản Sepay

1. Truy cập [https://my.sepay.vn/register](https://my.sepay.vn/register?onboarding=payment-gateway)
2. Đăng ký tài khoản → Chọn gói dịch vụ
3. Vào mục "Cổng thanh toán" → Chọn "Đăng ký"
4. Chọn "Bắt đầu với Sandbox" để test
5. Lấy `MERCHANT_ID` và `SECRET_KEY` từ màn hình thông tin tích hợp
6. Cấu hình IPN URL: `http://your-domain.com/api/payment/sepay/ipn`

---

## 📁 Các file đã thay đổi

### Backend

1. **`src/services/SepayService.js`** (MỚI)

   - `createSepayPayment()` - Tạo thanh toán Sepay
   - `handleSepayCallback()` - Xử lý callback từ Sepay
   - `handleSepayIPN()` - Xử lý webhook IPN
   - `getSepayPaymentDetail()` - Lấy chi tiết thanh toán
   - `cancelSepayOrder()` - Hủy đơn hàng Sepay

2. **`src/controllers/PaymentController.js`** (CẬP NHẬT)

   - Thêm các controller methods cho Sepay

3. **`src/routes/PaymentRouter.js`** (CẬP NHẬT)

   - Thêm routes:
     - `POST /api/payment/sepay/create`
     - `GET /api/payment/sepay/success`
     - `GET /api/payment/sepay/error`
     - `GET /api/payment/sepay/cancel`
     - `POST /api/payment/sepay/ipn`
     - `GET /api/payment/sepay/detail/:paymentCode`
     - `POST /api/payment/sepay/cancel/:paymentCode`

4. **`src/models/PaymentModel.js`** (CẬP NHẬT)
   - Thêm fields:
     - `sepayOrderId` - ID đơn hàng từ Sepay
     - `sepayTransactionId` - ID giao dịch từ Sepay
     - `sepayPaymentMethod` - Phương thức thanh toán Sepay
     - `sepayData` - Lưu toàn bộ response từ IPN
   - Cập nhật status enum: thêm `CANCELLED`

### Frontend

1. **`src/app/api/services/PaymentService.js`** (CẬP NHẬT)

   - Thêm methods:
     - `createSepayPayment()` - Gọi API tạo thanh toán Sepay
     - `getSepayPaymentDetail()` - Lấy chi tiết thanh toán Sepay
     - `cancelSepayOrder()` - Hủy đơn hàng Sepay

2. **`src/app/pages/User/PaymentPage/PaymentPage.jsx`** (CẬP NHẬT)
   - Thêm state `sepayPaymentMethod` để chọn phương thức Sepay
   - Thêm radio button "Sepay" trong danh sách payment type
   - Thêm dropdown chọn phương thức Sepay (QR Banking / Thẻ / NAPAS)
   - Cập nhật `proceedWithPayment()` để xử lý thanh toán Sepay

---

## 🎨 Sử dụng trên Frontend

### UI thanh toán

Trên trang `/payment`, khách hàng có thể chọn:

1. **PayPal**
2. **Thanh toán QR** (VietQR - hiện tại)
3. **Sepay** (MỚI)
   - Quét mã QR chuyển khoản ngân hàng
   - Thanh toán bằng thẻ tín dụng/ghi nợ
   - Quét mã QR NAPAS

### Flow thanh toán Sepay

```javascript
// Khi user chọn "Sepay" và nhấn "Thanh toán"
1. Frontend gọi API: POST /api/payment/sepay/create
   Body: {
     paymentCode: "SEPAY-1234567890",
     orderId: "order_id",
     totalPrice: 500000,
     sepayPaymentMethod: "BANK_TRANSFER", // hoặc "CARD", "NAPAS_BANK_TRANSFER"
     customerInfo: { userId: "user_id" }
   }

2. Backend trả về:
   {
     status: "OK",
     data: {
       checkoutURL: "https://pay.sepay.vn/v1/checkout/init",
       checkoutFormFields: {
         merchant: "...",
         operation: "PURCHASE",
         payment_method: "BANK_TRANSFER",
         order_invoice_number: "SEPAY-1234567890",
         order_amount: "500000",
         currency: "VND",
         signature: "..."
       }
     }
   }

3. Frontend tạo form và submit đến checkoutURL
4. User được redirect đến Sepay để thanh toán
5. Sau khi thanh toán, Sepay redirect về:
   - Success: /payment-result?status=success&paymentCode=...&orderId=...
   - Error: /payment-result?status=error&paymentCode=...&orderId=...
   - Cancel: /payment-result?status=cancel&paymentCode=...&orderId=...

6. Đồng thời, Sepay gửi webhook IPN đến backend: POST /api/payment/sepay/ipn
   Backend cập nhật trạng thái payment và order
```

---

## 🔐 Bảo mật

### Chữ ký (Signature)

Sepay sử dụng HMAC SHA-256 để ký các request:

```javascript
// Backend tự động tạo signature khi gọi:
const checkoutFormFields = client.checkout.initOneTimePaymentFields({
  // ... params
});

// Signature được tạo từ các trường theo thứ tự:
// merchant + operation + payment_method + order_invoice_number +
// order_amount + currency + ... + secret_key
```

### IPN Webhook

- Backend **PHẢI** trả về `{ success: true }` với status code 200 để Sepay biết IPN đã được nhận
- Sepay sẽ retry nếu không nhận được phản hồi đúng (tối đa 7 lần, trong 5 giờ)
- Backend kiểm tra trùng lặp IPN dựa vào `transaction.id`

---

## 🧪 Testing

### Môi trường Sandbox

1. Đăng ký tài khoản sandbox tại [https://my.dev.sepay.vn/register](https://my.dev.sepay.vn/register)
2. Lấy `MERCHANT_ID` và `SECRET_KEY` từ sandbox
3. Cấu hình `.env`:
   ```env
   SEPAY_ENV=sandbox
   SEPAY_MERCHANT_ID=sandbox_merchant_id
   SEPAY_SECRET_KEY=sandbox_secret_key
   ```

### Giả lập giao dịch

1. Vào [https://my.dev.sepay.vn/transactions](https://my.dev.sepay.vn/transactions)
2. Chọn "Giả lập giao dịch"
3. Tạo giao dịch test để kiểm tra IPN webhook

### Kiểm tra webhook

1. Vào [https://my.dev.sepay.vn/webhookslog](https://my.dev.sepay.vn/webhookslog)
2. Xem danh sách các webhook đã gửi
3. Kiểm tra status và response

---

## 🚀 Go Live (Production)

### Yêu cầu:

- ✅ Có tài khoản ngân hàng cá nhân/doanh nghiệp
- ✅ Đã hoàn thành tích hợp và test ở Sandbox

### Các bước:

1. **Liên kết tài khoản ngân hàng thật**

   - Vào [https://my.sepay.vn/](https://my.sepay.vn/)
   - Cổng thanh toán → Đăng ký → Chọn "Chuyển sang Production"

2. **Lấy credentials Production**

   - Copy `MERCHANT_ID` và `SECRET_KEY` chính thức

3. **Cập nhật biến môi trường**

   ```env
   SEPAY_ENV=production
   SEPAY_MERCHANT_ID=production_merchant_id
   SEPAY_SECRET_KEY=production_secret_key
   SEPAY_SUCCESS_URL=https://your-domain.com/payment-result?status=success
   SEPAY_ERROR_URL=https://your-domain.com/payment-result?status=error
   SEPAY_CANCEL_URL=https://your-domain.com/payment-result?status=cancel
   SEPAY_IPN_URL=https://your-domain.com/api/payment/sepay/ipn
   ```

4. **Cập nhật IPN URL trên Sepay dashboard**
   - Đảm bảo IPN URL có thể truy cập từ internet (không phải localhost)
   - Sử dụng HTTPS

---

## 📊 API Endpoints

### 1. Tạo thanh toán Sepay

```http
POST /api/payment/sepay/create
Content-Type: application/json

{
  "paymentCode": "SEPAY-1234567890",
  "orderId": "order_id",
  "totalPrice": 500000,
  "sepayPaymentMethod": "BANK_TRANSFER",
  "customerInfo": {
    "userId": "user_id"
  }
}
```

**Response:**

```json
{
  "status": "OK",
  "message": "SUCCESS",
  "data": {
    "checkoutURL": "https://pay.sepay.vn/v1/checkout/init",
    "checkoutFormFields": { ... },
    "paymentCode": "SEPAY-1234567890",
    "orderId": "order_id",
    "amount": 500000
  }
}
```

### 2. Callback URLs

```http
GET /api/payment/sepay/success?paymentCode=...&orderId=...
GET /api/payment/sepay/error?paymentCode=...&orderId=...
GET /api/payment/sepay/cancel?paymentCode=...&orderId=...
```

### 3. IPN Webhook

```http
POST /api/payment/sepay/ipn
Content-Type: application/json

{
  "timestamp": 1759134682,
  "notification_type": "ORDER_PAID",
  "order": {
    "id": "...",
    "order_invoice_number": "SEPAY-1234567890",
    "order_status": "CAPTURED",
    "order_amount": "500000"
  },
  "transaction": {
    "id": "...",
    "payment_method": "BANK_TRANSFER",
    "transaction_status": "APPROVED",
    "transaction_amount": "500000"
  }
}
```

**Response:**

```json
{
  "success": true
}
```

### 4. Lấy chi tiết thanh toán

```http
GET /api/payment/sepay/detail/:paymentCode
```

**Response:**

```json
{
  "status": "OK",
  "message": "SUCCESS",
  "data": {
    "_id": "...",
    "paymentCode": "SEPAY-1234567890",
    "paymentMethod": "sepay",
    "orderId": "order_id",
    "status": "SUCCESS",
    "sepayOrderId": "...",
    "sepayTransactionId": "...",
    "sepayPaymentMethod": "BANK_TRANSFER",
    "sepayData": { ... }
  }
}
```

### 5. Hủy đơn hàng

```http
POST /api/payment/sepay/cancel/:paymentCode
```

**Response:**

```json
{
  "status": "OK",
  "message": "Order cancelled successfully",
  "data": { ... }
}
```

---

## 🔧 Troubleshooting

### Lỗi: "Sepay credentials are missing"

- Kiểm tra file `.env` đã có `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY` chưa
- Restart server sau khi cập nhật `.env`

### Lỗi: "Invalid signature"

- Kiểm tra `SECRET_KEY` có đúng không
- Đảm bảo không có khoảng trắng thừa trong `.env`

### IPN không được gọi

- Kiểm tra IPN URL có đúng và có thể truy cập từ internet không
- Kiểm tra firewall/security group
- Xem log tại [https://my.sepay.vn/webhookslog](https://my.sepay.vn/webhookslog)

### Payment không được cập nhật trạng thái

- Kiểm tra IPN webhook có được gọi không
- Kiểm tra backend log có lỗi không
- Đảm bảo backend trả về `{ success: true }` cho IPN

---

## 📚 Tài liệu tham khảo

- [Sepay Documentation](https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau)
- [Sepay Node.js SDK](https://developer.sepay.vn/vi/cong-thanh-toan/sdk/nodejs)
- [Sepay IPN/Webhook](https://docs.sepay.vn/tich-hop-webhooks.html)
- [Sepay GitHub Repository](https://github.com/sepayvn/sepay-pg-node)

---

## ✅ Checklist triển khai

### Backend

- [x] Cài đặt `sepay-pg-node` package
- [x] Cấu hình biến môi trường `.env`
- [x] Tạo `SepayService.js`
- [x] Cập nhật `PaymentController.js`
- [x] Cập nhật `PaymentRouter.js`
- [x] Cập nhật `PaymentModel.js`

### Frontend

- [x] Cập nhật `PaymentService.js` (API service)
- [x] Cập nhật `PaymentPage.jsx` (UI + Logic)
- [x] Thêm option "Sepay" vào payment type
- [x] Thêm dropdown chọn phương thức Sepay

### Testing

- [ ] Test ở môi trường Sandbox
- [ ] Test thanh toán QR Banking
- [ ] Test thanh toán bằng thẻ
- [ ] Test thanh toán NAPAS QR
- [ ] Test IPN webhook
- [ ] Test callback success/error/cancel
- [ ] Test hủy đơn hàng

### Production

- [ ] Đăng ký tài khoản Production
- [ ] Liên kết tài khoản ngân hàng
- [ ] Cập nhật credentials Production
- [ ] Cập nhật IPN URL (HTTPS)
- [ ] Test trên Production

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, liên hệ:

- **Sepay Support**: [https://sepay.vn/lien-he.html](https://sepay.vn/lien-he.html)
- **Telegram**: [https://t.me/s/sepaychannel](https://t.me/s/sepaychannel)
- **Facebook**: [https://www.facebook.com/messages/t/sepay.vn](https://www.facebook.com/messages/t/sepay.vn)

---

**Chúc bạn tích hợp thành công! 🎉**
