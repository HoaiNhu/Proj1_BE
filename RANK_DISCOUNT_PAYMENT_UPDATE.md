# 🎖️ CẬP NHẬT ÁP DỤNG RANK DISCOUNT VÀO PAYMENT FLOW

## 📋 Tổng Quan

Đã hoàn thành việc tích hợp rank discount vào payment flow, bao gồm:

- ✅ Backend: Tự động áp dụng rank discount khi tạo payment
- ✅ Frontend: Hiển thị rank discount trong UI payment page và confirm modal

---

## 🔧 BACKEND UPDATES

### File: `src/services/PaymentService.js`

#### 1. **createPayment()** - Thanh toán PayPal

```javascript
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

      // Cập nhật order với rank discount
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
        `🎖️ Áp dụng rank discount ${rankDiscountPercent}% = ${rankDiscount}đ cho payment`
      );
    }
  } catch (error) {
    console.error("Error applying rank discount:", error);
  }
} else {
  finalTotalPrice = existingOrder.totalPrice;
}
```

**Logic:**

- Kiểm tra xem order đã có rank discount chưa
- Nếu chưa có và user đã đăng nhập:
  - Lấy thông tin currentRank của user
  - Tính rank discount = totalItemPrice \* discountPercent / 100
  - Cập nhật order với rankDiscount, rankDiscountPercent
  - Tính lại totalPrice (đã trừ rank discount)
  - Lưu order vào database
- Sử dụng finalTotalPrice cho payment amount

#### 2. **createQrPayment()** - Thanh toán QR

Áp dụng logic tương tự như createPayment()

**Điểm khác:**

- Sử dụng finalTotalPrice cho VietQR API amount
- Log message: "cho QR payment"

---

## 🎨 FRONTEND UPDATES

### File: `src/app/pages/User/PaymentPage/PaymentPage.jsx`

#### 1. **Thêm State để Lấy Rank Discount từ Order**

```jsx
// Lấy rank discount từ order
const rankDiscount = lastOrder.rankDiscount || 0;
const rankDiscountPercent = lastOrder.rankDiscountPercent || 0;
```

#### 2. **Cập Nhật Logic Tính Tổng Tiền**

```jsx
useEffect(() => {
  setFinalTotalPrice(
    originalTotalPrice - rankDiscount - coinsApplied - voucherDiscount
  );
}, [originalTotalPrice, rankDiscount, coinsApplied, voucherDiscount]);
```

#### 3. **Thêm UI Hiển Thị Rank Discount (Sau Voucher Discount)**

```jsx
{
  rankDiscount > 0 && (
    <div
      className="rank-discount"
      style={{
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <label
        style={{
          paddingLeft: "10px",
          color: "#d4af37", // Màu vàng cho rank
          fontWeight: "bold",
        }}
      >
        Giảm giá rank ({rankDiscountPercent}%):
      </label>
      <p
        style={{
          margin: 0,
          fontWeight: "bold",
          color: "#d4af37",
          paddingRight: "10px",
        }}
      >
        -{rankDiscount.toLocaleString()} VND
      </p>
    </div>
  );
}
```

**Vị trí trong UI:**

```
Tạm tính: XXX VND
Phí vận chuyển: XXX VND
Giảm giá voucher: -XXX VND
🎖️ Giảm giá rank (X%): -XXX VND  <-- ĐÂY NÈ!
Giảm giá từ xu: -XXX VND
────────────────────────────────
Tổng: XXX VND
```

#### 4. **Truyền Rank Discount vào Confirm Modal**

```jsx
<ConfirmPaymentModal
  orderData={{
    originalTotalPrice,
    rankDiscount, // ← Thêm
    rankDiscountPercent, // ← Thêm
    voucherDiscount,
    coinsApplied,
    finalTotalPrice,
    selectedVouchers,
    paymentType,
  }}
/>
```

---

### File: `src/app/components/ConfirmPaymentModal/ConfirmPaymentModal.jsx`

#### 1. **Nhận Rank Discount từ Props**

```jsx
const {
  originalTotalPrice,
  rankDiscount, // ← Thêm
  rankDiscountPercent, // ← Thêm
  voucherDiscount,
  coinsApplied,
  finalTotalPrice,
  selectedVouchers,
  paymentType,
} = orderData || {};
```

#### 2. **Hiển Thị Rank Discount trong Modal**

```jsx
{
  rankDiscount > 0 && (
    <div className="summary-row discount">
      <span>
        Giảm giá rank {rankDiscountPercent > 0 && `(${rankDiscountPercent}%)`}:
      </span>
      <span className="amount discount-amount" style={{ color: "#d4af37" }}>
        -{rankDiscount.toLocaleString()} VND
      </span>
    </div>
  );
}
```

**Vị trí trong Modal:**

```
Chi tiết đơn hàng
────────────────────────────────
Tổng tiền hàng: XXX VND
Giảm giá voucher: -XXX VND
🎖️ Giảm giá rank (X%): -XXX VND  <-- ĐÂY NÈ!
Giảm giá từ xu: -XXX VND
────────────────────────────────
Tổng thanh toán: XXX VND
```

---

## 🔄 FLOW HOÀN CHỈNH

### 1. Khi User Đặt Hàng (OrderService.createOrder)

```
1. Kiểm tra user có currentRank không
2. Tính rankDiscount = totalItemPrice * discountPercent / 100
3. Lưu rankDiscount, rankDiscountPercent vào order
4. totalPrice = totalItemPrice - rankDiscount + shippingPrice
5. Tạo order trong database
```

### 2. Khi User Vào Payment Page

```
1. Lấy lastOrder từ Redux/state
2. Extract rankDiscount và rankDiscountPercent từ lastOrder
3. Hiển thị rank discount trong UI
4. Tính finalTotalPrice = originalTotalPrice - rankDiscount - voucher - coins
```

### 3. Khi User Click Thanh Toán

```
1. Mở Confirm Payment Modal
2. Truyền rankDiscount, rankDiscountPercent vào modal
3. Modal hiển thị tất cả các discount (voucher, rank, coins)
4. User confirm
```

### 4. Khi Gọi API Payment (PaymentService)

```
1. Backend kiểm tra order đã có rankDiscount chưa
2. Nếu chưa có:
   - Lấy currentRank của user
   - Tính và áp dụng rank discount
   - Cập nhật order
3. Sử dụng finalTotalPrice đã trừ rank discount để tạo payment
4. Trả về payment URL/QR code
```

---

## 🎨 THIẾT KẾ UI

### Màu Sắc

- **Rank Discount**: `#d4af37` (Vàng kim - tượng trưng cho rank)
- **Voucher Discount**: Màu mặc định hoặc `#3a060e` (Đỏ nâu)
- **Coins Discount**: `#3a060e` (Đỏ nâu)

### Font Weight

- Rank discount: `bold` để nổi bật
- Voucher discount: `bold` nếu > 0
- Coins discount: `bold`

### Thứ Tự Hiển Thị

```
1. Tạm tính (totalItemPrice)
2. Phí vận chuyển (shippingPrice)
3. Giảm giá voucher (voucherDiscount)
4. 🎖️ Giảm giá rank (rankDiscount)  ← DƯỚI VOUCHER
5. Giảm giá từ xu (coinsApplied)
6. ──────────────────────
7. Tổng thanh toán (finalTotalPrice)
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Backend: Áp dụng rank discount trong createPayment()
- [x] Backend: Áp dụng rank discount trong createQrPayment()
- [x] Frontend: Lấy rankDiscount từ lastOrder
- [x] Frontend: Hiển thị rank discount trong Payment Page
- [x] Frontend: Truyền rank discount vào Confirm Modal
- [x] Frontend: Hiển thị rank discount trong Confirm Modal
- [x] UI: Đặt rank discount dưới voucher discount
- [x] UI: Sử dụng màu vàng kim (#d4af37) cho rank
- [x] Logic: Tính finalTotalPrice bao gồm rank discount

---

## 🧪 TESTING

### Test Case 1: User Có Rank Bronze (0% discount)

```
1. Đăng nhập user có rank Bronze
2. Tạo đơn hàng 200.000đ
3. Vào Payment Page
4. ✓ Không thấy dòng "Giảm giá rank"
5. ✓ Tổng = 200.000 + phí ship
```

### Test Case 2: User Có Rank Silver (5% discount)

```
1. Đăng nhập user có rank Silver (totalSpending >= 500k)
2. Tạo đơn hàng 1.000.000đ
3. Vào Payment Page
4. ✓ Thấy "Giảm giá rank (5%): -50.000 VND"
5. ✓ Tổng = 1.000.000 - 50.000 + phí ship
6. Click Thanh toán
7. ✓ Modal hiển thị rank discount màu vàng
8. Confirm payment
9. ✓ Payment amount = totalPrice đã trừ rank discount
```

### Test Case 3: User Có Rank Gold (10% discount) + Voucher + Xu

```
1. Đăng nhập user có rank Gold (totalSpending >= 1.5 triệu)
2. Tạo đơn hàng 2.000.000đ
3. Áp dụng voucher giảm 100.000đ
4. Sử dụng 50.000 xu
5. Vào Payment Page
6. ✓ Thấy:
   - Tạm tính: 2.000.000đ
   - Phí ship: 30.000đ
   - Giảm giá voucher: -100.000đ
   - Giảm giá rank (10%): -200.000đ  ← Dưới voucher
   - Giảm giá từ xu: -50.000đ
   - Tổng: 1.680.000đ
7. ✓ Confirm modal hiển thị đúng tất cả discounts
8. ✓ Payment amount = 1.680.000đ
```

---

## 📝 LƯU Ý

1. **Order đã có rank discount**: Backend không tính lại nữa, sử dụng giá trị có sẵn
2. **User chưa đăng nhập**: Không có rank discount (rankDiscount = 0)
3. **Rank chưa active**: Không áp dụng discount
4. **Order Model**: Đảm bảo có field `rankDiscount` và `rankDiscountPercent`
5. **Thứ tự giảm giá**: Voucher → Rank → Coins
6. **Màu sắc**: Rank dùng vàng (#d4af37) để phân biệt với các discount khác

---

## 🚀 DEMO FLOW

```
User: John (Rank Silver - 5%)
Tạo đơn: 1.000.000đ
Voucher: 50.000đ
Xu: 30.000đ
Phí ship: 30.000đ

Tính toán:
─────────────────────────────────
Tạm tính:          1.000.000 VND
Phí vận chuyển:       30.000 VND
Giảm giá voucher:    -50.000 VND
🎖️ Giảm giá rank (5%): -50.000 VND
Giảm giá từ xu:      -30.000 VND
─────────────────────────────────
Tổng thanh toán:     900.000 VND
```

---

**Hoàn thành! 🎉**
Rank discount đã được tích hợp hoàn toàn vào payment flow.
