# 🎯 Order Status Auto-Update Fix

## ✅ Vấn đề đã fix

Trước đây khi thanh toán Sepay thành công:

- ✅ `paymentStatus` được cập nhật thành "SUCCESS"
- ✅ `isPaid` được set thành `true`
- ✅ `paidAt` được set thành thời gian thanh toán
- ❌ **`status` (trạng thái đơn hàng) KHÔNG được cập nhật**

## 🔧 Giải pháp

### 1. Cập nhật SepayService.js

**File**: `src/services/SepayService.js`

Thêm import Status model:

```javascript
const Status = require("../models/StatusModel");
```

Trong `handleSepayIPN()`, khi xử lý `ORDER_PAID`:

```javascript
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
  console.warn(`⚠️ PAID status not found in database, keeping current status`);
}
```

### 2. Kiểm tra Status PAID trong database

**Script**: `ensure-paid-status.js`

Chạy script để verify:

```bash
node ensure-paid-status.js
```

Kết quả:

```
✅ PAID status exists:
  _id: 68e713cd744de60972b7f633
  statusCode: PAID
  statusName: Đã thanh toán

📋 All statuses:
1. PENDING - Đã nhận (676180405f022353257b7ddd)
2. PROCESSING - Đang chuẩn bị (676180755f022353257b7de0)
3. DELIVERING - Đang vận chuyển (676180925f022353257b7de3)
4. COMPLETED - Đã giao (67618186b260255b08a4ab3f)
5. CANCEL - Đã hủy (6770a84d0ec3917f0a7c9559)
6. PAID - Đã thanh toán (68e713cd744de60972b7f633)
```

## 🎬 Luồng hoạt động mới

1. User tạo order → status = "PENDING" (Đã nhận)
2. User thanh toán Sepay → chờ xử lý
3. **Sepay gửi IPN webhook** → Backend nhận thông báo
4. Backend cập nhật:
   - `paymentStatus = "SUCCESS"`
   - `isPaid = true`
   - `paidAt = new Date()`
   - **`status = ObjectId("68e713cd744de60972b7f633")` (PAID - Đã thanh toán)** ✨

## 🧪 Cách test

### Test trên development:

1. Tạo đơn hàng mới
2. Thanh toán bằng Sepay
3. Sau khi thanh toán thành công, kiểm tra MongoDB:
   ```json
   {
     "status": { "$oid": "68e713cd744de60972b7f633" },
     "paymentStatus": "SUCCESS",
     "isPaid": true,
     "paidAt": "2025-12-14T10:00:00.000Z"
   }
   ```
4. Trong frontend admin, trạng thái order phải hiển thị **"Đã thanh toán"**

### Test trên production:

1. Deploy backend lên Render
2. Test thanh toán thật với Sepay
3. Kiểm tra IPN logs trên Render:
   ```
   🎯 Order status updated to PAID (68e713cd744de60972b7f633)
   ✅ Payment SUCCESS for order 693e816e13f3017150e9a37b
   ```

## 📋 Thứ tự Status

1. **PENDING** (Đã nhận) → Order vừa tạo
2. **PAID** (Đã thanh toán) → Thanh toán thành công ✨
3. **PROCESSING** (Đang chuẩn bị) → Admin bắt đầu làm
4. **DELIVERING** (Đang vận chuyển) → Đang giao hàng
5. **COMPLETED** (Đã giao) → Hoàn thành
6. **CANCEL** (Đã hủy) → Đơn bị hủy

## ⚠️ Lưu ý

- IPN webhook phải được cấu hình đúng trong .env:
  ```
  SEPAY_IPN_URL=https://proj1-be.onrender.com/api/payment/sepay/ipn
  ```
- Status "PAID" phải tồn tại trong database (đã verify ✅)
- Nếu status PAID không tồn tại, order sẽ giữ nguyên status hiện tại (có warning log)

## 🎉 Kết quả

Giờ khi thanh toán Sepay thành công:

- ✅ `paymentStatus` = "SUCCESS"
- ✅ `isPaid` = true
- ✅ `paidAt` = timestamp
- ✅ **`status` = "PAID" (Đã thanh toán)** ← MỚI!
- ✅ Cart tự động xóa ở frontend
