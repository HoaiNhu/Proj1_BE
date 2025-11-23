# Hướng dẫn fix flow voucher - COMPLETED ✅

## 1. ✅ Backend Changes

### OrderModel.js

- Thêm fields: `vouchersUsed[]`, `voucherDiscount`
- Cập nhật middleware tính totalPrice bao gồm voucherDiscount

### OrderService.js

- Thêm function `confirmPaymentWithVoucher()` để:
  - Cập nhật voucher info vào order
  - Mark UserVoucher as USED
  - Tăng usageCount trong Voucher model

### OrderController.js

- Thêm `confirmPaymentWithVoucher` controller

### OrderRouter.js

- Thêm route POST `/confirm-payment-voucher`

---

## 2. ✅ Frontend Changes

### PaymentPage.jsx

**Thêm:**

- State `showConfirmModal`, `isConfirming`
- Import `ConfirmPaymentModal` component
- Function `handleConfirmPayment()` - gọi API confirm trước khi thanh toán
- Function `calculateVoucherDiscountForVoucher()` - tính discount cho từng voucher
- Function `proceedWithPayment()` - tiến hành thanh toán sau khi confirm
- Render `<ConfirmPaymentModal>` với props đầy đủ

**Flow mới:**

1. User click "Thanh toán" → Hiện modal xác nhận
2. User click "Xác nhận thanh toán" trong modal
3. Gọi API `confirmPaymentWithVoucher` → Backend cập nhật voucher
4. Sau đó mới tiến hành PayPal/QR payment

### ConfirmPaymentModal Component (MỚI)

- Hiển thị tóm tắt: tổng tiền, voucher discount, coins discount, final price
- List vouchers đã chọn
- Phương thức thanh toán
- Lưu ý về việc voucher sẽ bị đánh dấu đã dùng

### OrderService.js (Frontend)

- Thêm function `confirmPaymentWithVoucher()`

---

## 3. ✅ BankingInfoPage Updates

- Nhận thêm `selectedVouchers` từ navigation state
- Hiển thị voucher info trong order summary

---

## 4. 📝 OrderHistoryPage & OrderDetailHistoryPage

### Cần thêm hiển thị voucher info:

**OrderHistoryCardComponent** (nếu có hiển thị giá):

```jsx
{
  order.voucherDiscount > 0 && (
    <div className="voucher-info">
      <span>
        Giảm giá voucher: -{order.voucherDiscount.toLocaleString()} VND
      </span>
    </div>
  );
}
```

**OrderDetailHistoryPage.jsx:**

Thêm sau phần "Tổng tiền sản phẩm":

```jsx
{
  /* Hiển thị voucher nếu có */
}
{
  order.vouchersUsed && order.vouchersUsed.length > 0 && (
    <div className="vouchers-used">
      <h3>Voucher đã sử dụng:</h3>
      {order.vouchersUsed.map((voucher, index) => (
        <div key={index} className="voucher-item">
          <p>
            <strong>Mã:</strong> {voucher.voucherCode}
          </p>
          <p>
            <strong>Tên:</strong> {voucher.voucherName}
          </p>
          <p>
            <strong>Loại:</strong> {voucher.voucherType}
          </p>
          <p>
            <strong>Giảm giá:</strong>{" "}
            {voucher.discountAmount?.toLocaleString()} VND
          </p>
        </div>
      ))}
    </div>
  );
}

{
  order.voucherDiscount > 0 && (
    <div className="row">
      <label>
        <strong>Tổng giảm giá voucher:</strong> -
        {order.voucherDiscount.toLocaleString()} VND
      </label>
    </div>
  );
}
```

Cập nhật phần tính tổng:

```jsx
<div className="total-cost">
  <div className="cost">
    <label className="product-cost">
      Tổng tiền sản phẩm: {totalAmount.toLocaleString()} VND
    </label>
    {order.voucherDiscount > 0 && (
      <label className="voucher-discount" style={{ color: "#b1e321" }}>
        Giảm giá voucher: -{order.voucherDiscount.toLocaleString()} VND
      </label>
    )}
    {order.coinsUsed > 0 && (
      <label className="coins-discount" style={{ color: "#28a745" }}>
        Giảm giá từ xu: -{order.coinsUsed.toLocaleString()} VND
      </label>
    )}
    <label className="delivery-cost">
      Phí vận chuyển: {deliveryCost.toLocaleString()} VND
    </label>
  </div>
  <div className="total-bill">
    Tổng hóa đơn: {order.totalPrice?.toLocaleString()} VND
  </div>
</div>
```

---

## Test Flow:

### Scenario 1: Thanh toán với voucher

1. Chọn sản phẩm → Order Information → Payment
2. Apply voucher code hoặc chọn từ modal
3. Xem giảm giá hiển thị đúng
4. Click "Thanh toán"
5. **MODAL xuất hiện** với tóm tắt
6. Click "Xác nhận thanh toán"
7. Backend cập nhật:
   - `order.vouchersUsed` = [voucher info]
   - `order.voucherDiscount` = total discount
   - `userVoucher.status` = 'USED'
   - `voucher.usageCount++`
8. Chuyển sang Banking/PayPal
9. Kiểm tra voucher trong "My Vouchers" → status = USED
10. Kiểm tra Order History → voucher info hiển thị

### Scenario 2: Thanh toán với voucher + coins

1. Apply cả voucher và coins
2. Final price = original - voucher - coins
3. Modal hiển thị cả 2 giảm giá
4. Confirm → Backend cập nhật cả 2
5. Order history hiển thị cả 2

### Scenario 3: Không dùng voucher

1. Bỏ qua voucher
2. Modal vẫn xuất hiện (không có voucher section)
3. Thanh toán bình thường

---

## Lưu ý quan trọng:

✅ Voucher chỉ được mark USED sau khi user confirm trong modal
✅ Nếu user cancel modal → voucher vẫn ACTIVE
✅ Backend validate voucher trước khi apply
✅ Frontend và Backend đều tính discount để so sánh
✅ Order history phải populate vouchersUsed để hiển thị đầy đủ info

---

## Files đã thay đổi:

### Backend:

- `src/models/OrderModel.js` ✅
- `src/services/OrderService.js` ✅
- `src/controllers/OrderController.js` ✅
- `src/routes/OrderRouter.js` ✅

### Frontend:

- `src/app/pages/User/PaymentPage/PaymentPage.jsx` ✅
- `src/app/pages/User/BankingInfoPage/BankingInfoPage.jsx` ✅
- `src/app/components/ConfirmPaymentModal/ConfirmPaymentModal.jsx` ✅ (NEW)
- `src/app/components/ConfirmPaymentModal/ConfirmPaymentModal.css` ✅ (NEW)
- `src/app/api/services/OrderService.js` ✅

### Cần cập nhật thủ công:

- `src/app/pages/User/OrderDetailHistoryPage/OrderDetailHistoryPage.jsx` 📝
- `src/app/components/OrderHistoryCardComponent/OrderHistoryCardComponent.jsx` 📝 (nếu có)

---

## API Endpoints:

### POST /api/order/confirm-payment-voucher

**Headers:**

```
token: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "orderId": "673d...",
  "voucherData": {
    "selectedVouchers": [
      {
        "_id": "voucher_id",
        "voucherCode": "SAVE20",
        "voucherName": "Giảm 20%",
        "voucherType": "PERCENTAGE",
        "discountAmount": 50000
      }
    ],
    "voucherDiscount": 50000,
    "finalTotalPrice": 150000
  }
}
```

**Response:**

```json
{
  "status": "OK",
  "message": "Xác nhận thanh toán thành công",
  "data": {
    /* updated order */
  }
}
```

---

## Restart Services:

```bash
# Backend
cd c:\Users\Lenovo\STUDY\Proj1_BE
npm run dev

# Frontend
cd c:\Users\Lenovo\STUDY\FE-Project_AvocadoCake
npm start
```

**✨ Done! Flow voucher đã hoàn thiện!**
