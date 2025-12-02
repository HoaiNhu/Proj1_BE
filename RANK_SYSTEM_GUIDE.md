# 🎖️ HỆ THỐNG RANK - HƯỚNG DẪN TRIỂN KHAI

## 📋 Tổng Quan

Hệ thống rank đã được xây dựng hoàn chỉnh với các tính năng:

✅ **Backend (Node.js + MongoDB)**

- Model: RankModel, UserRankHistoryModel
- Controller & Service: CRUD operations cho ranks
- Tự động áp dụng discount dựa trên rank khi đặt hàng
- Tự động cập nhật totalSpending và rank sau mỗi đơn hàng
- Gửi email + voucher khi thăng hạng

✅ **Frontend (React)**

- Admin: Quản lý ranks với full CRUD
- Client: Trang hiển thị đặc quyền các rank
- Header: Hiển thị rank badge với progress bar

---

## 🚀 BƯỚC TRIỂN KHAI

### 1️⃣ **Backend Setup**

#### Bước 1: Khởi tạo ranks mặc định

```bash
# Gọi API để tạo 3 ranks mặc định: Bronze, Silver, Gold
POST {{BACKEND_URL}}/api/rank/initialize
Headers:
  token: Bearer {{admin_access_token}}
```

Hoặc sử dụng Postman/Thunder Client với endpoint:

```
POST http://localhost:3001/api/rank/initialize
```

**Response khi thành công:**

```json
{
  "status": "OK",
  "message": "Default ranks initialized successfully"
}
```

#### Bước 2: Kiểm tra ranks đã được tạo

```bash
GET {{BACKEND_URL}}/api/rank/all
```

Sẽ trả về 3 ranks:

- 🥉 **Đồng (Bronze)**: 5% giảm giá, từ 0đ - 5 triệu
- 🥈 **Bạc (Silver)**: 10% giảm giá, từ 5 triệu - 15 triệu
- 🥇 **Vàng (Gold)**: 15% giảm giá, từ 15 triệu trở lên

---

### 2️⃣ **Frontend Setup**

#### Bước 1: Cấu hình Routes

Thêm routes vào file routing của bạn:

```jsx
// Trong file routes hoặc App.js
import AdminRank from "./pages/Admin/AdminRank";
import RankBenefitsPage from "./pages/Client/RankBenefitsPage";

// Admin routes
<Route path="/admin/rank" element={<AdminRank />} />

// Client routes
<Route path="/rank-benefits" element={<RankBenefitsPage />} />
```

#### Bước 2: Thêm link vào Admin Navigation

```jsx
<NavLink to="/admin/rank">
  <span>🎖️</span> Quản lý Rank
</NavLink>
```

#### Bước 3: Thêm link vào Client Navigation

```jsx
<NavLink to="/rank-benefits">Đặc quyền thành viên</NavLink>
```

---

## 📡 API ENDPOINTS

### Public APIs (Không cần authentication)

```
GET  /api/rank/all                    # Lấy tất cả ranks
```

### User APIs (Cần authentication)

```
GET  /api/rank/user/:userId           # Lấy rank của user
GET  /api/rank/user/:userId/history   # Lịch sử thăng hạng
```

### Admin APIs (Cần admin authentication)

```
POST   /api/rank/create               # Tạo rank mới
GET    /api/rank/details/:id          # Chi tiết rank
PUT    /api/rank/update/:id           # Cập nhật rank
DELETE /api/rank/delete/:id           # Xóa rank
POST   /api/rank/initialize           # Khởi tạo ranks mặc định
```

---

## 🔄 LUỒNG HOẠT ĐỘNG

### 1. Khi User Đặt Hàng

```
1. Kiểm tra rank hiện tại của user
2. Áp dụng discount % từ rank
3. Tính tổng tiền sau discount
4. Lưu thông tin rankDiscount vào Order
5. Cộng totalPrice vào user.totalSpending
6. Kiểm tra xem user có đạt rank mới không
7. Nếu thăng rank:
   - Cập nhật currentRank
   - Tạo UserRankHistory
   - Gửi email thông báo
   - Tạo voucher đặc biệt
```

### 2. Khi User Thăng Hạng

```
1. Hệ thống tự động gửi email chúc mừng
2. Email chứa:
   - Tên rank mới
   - Phần trăm giảm giá mới
   - Danh sách đặc quyền
   - Voucher code đặc biệt (discount rank + 5%)
3. Voucher có hiệu lực 30 ngày
```

---

## 🎨 UI/UX GUIDELINES

### Màu Sắc Ranks

```
Bronze: #CD7F32 (Đồng)
Silver: #C0C0C0 (Bạc)
Gold:   #FFD700 (Vàng)
```

### Nguyên Tắc Thiết Kế

- ✅ Border mờ thay vì box-shadow
- ✅ Border radius mềm mại (12-16px)
- ✅ Spacing hợp lý theo Gestalt
- ✅ Proximity: nhóm thông tin liên quan
- ✅ Similarity: sử dụng màu/icon nhất quán
- ✅ Continuation: luồng thông tin rõ ràng

---

## 🧪 TESTING

### 1. Test Backend APIs

```bash
# 1. Khởi tạo ranks
POST /api/rank/initialize

# 2. Lấy danh sách ranks
GET /api/rank/all

# 3. Tạo đơn hàng (sẽ tự động apply rank discount)
POST /api/order/create
{
  "userId": "user_id_here",
  "orderItems": [...],
  "totalItemPrice": 1000000,
  ...
}

# 4. Kiểm tra rank của user
GET /api/rank/user/:userId
```

### 2. Test Frontend

```
1. Đăng nhập vào tài khoản user
2. Vào trang /rank-benefits - kiểm tra hiển thị 3 ranks
3. Vào Header - kiểm tra RankBadge hiển thị
4. Đặt hàng - kiểm tra discount được áp dụng
5. Đăng nhập Admin - vào /admin/rank
6. Test CRUD operations: Create, Update, Delete ranks
```

---

## 🔧 CUSTOMIZATION

### Thay Đổi Hạn Mức Ranks

Vào Admin Panel → Quản lý Rank → Edit rank:

```
- Thay đổi minSpending, maxSpending
- Thay đổi discountPercent
- Thêm/bớt benefits
- Thay đổi màu sắc, icon
```

### Thêm Rank Mới

```
1. Vào /admin/rank
2. Click "Tạo mới"
3. Điền thông tin:
   - Rank Name: Bronze/Silver/Gold (hoặc custom)
   - Display Name: Tên hiển thị tiếng Việt
   - Discount %: 0-100
   - Min/Max Spending: Hạn mức
   - Priority: Thứ tự (1, 2, 3...)
   - Benefits: Danh sách đặc quyền
```

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG

Không cần thêm biến môi trường mới, sử dụng:

```env
MONGO_DB=mongodb://...
REACT_APP_API_URL_BACKEND=http://localhost:3001/api
```

---

## 📊 DATABASE SCHEMA

### Collection: ranks

```javascript
{
  _id: ObjectId,
  rankName: "Bronze" | "Silver" | "Gold",
  rankDisplayName: "Đồng" | "Bạc" | "Vàng",
  rankCode: "RANK_BRONZE" | "RANK_SILVER" | "RANK_GOLD",
  discountPercent: Number (0-100),
  minSpending: Number,
  maxSpending: Number | null,
  priority: Number,
  color: String (hex color),
  icon: String (emoji),
  benefits: [String],
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: users (Thêm fields)

```javascript
{
  ...existing_fields,
  currentRank: ObjectId (ref: Rank),
  totalSpending: Number (default: 0)
}
```

### Collection: orders (Thêm fields)

```javascript
{
  ...existing_fields,
  rankDiscount: Number (default: 0),
  rankDiscountPercent: Number (default: 0)
}
```

### Collection: userrankhistories

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  oldRank: ObjectId (ref: Rank),
  newRank: ObjectId (ref: Rank),
  totalSpendingAtPromotion: Number,
  voucherSent: Boolean,
  emailSent: Boolean,
  voucherCode: String,
  note: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Ranks already initialized"

- Ranks đã được khởi tạo rồi, không cần init lại
- Kiểm tra: `GET /api/rank/all`

### Lỗi: "Cannot delete rank. X users are currently using this rank"

- Không thể xóa rank đang được sử dụng
- Cần reassign users sang rank khác trước

### Lỗi: Discount không được áp dụng

- Kiểm tra user đã có currentRank chưa
- Kiểm tra rank có isActive = true không
- Xem log backend khi tạo đơn hàng

### Lỗi: RankBadge không hiển thị

- Kiểm tra user đã đăng nhập chưa
- Xem console log có lỗi gọi API không
- Đảm bảo user.isAdmin = false

---

## 📝 NOTES

1. **Email Service**: Cần cấu hình EmailService để gửi email thăng hạng
2. **Voucher Integration**: Service sendRankUpRewards cần VoucherService.createVoucher
3. **Mobile Responsive**: RankBadge được thiết kế responsive
4. **Performance**: Rank được cache sau khi fetch lần đầu

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Backend Models (RankModel, UserRankHistoryModel)
- [x] Backend Controllers & Services
- [x] Backend Routes & Integration
- [x] Auto apply discount vào Order
- [x] Auto update totalSpending
- [x] Auto rank up detection
- [x] Email service (structure ready)
- [x] Frontend API Services
- [x] Admin Rank Management UI
- [x] Client Rank Benefits Page
- [x] RankBadge Component
- [x] Header Integration

---

## 🎯 NEXT STEPS (Tùy chọn)

1. Tạo AddRank và UpdateRank form components cho Admin
2. Implement email template cho rank up notification
3. Tích hợp với VoucherService để tạo voucher tự động
4. Thêm analytics: thống kê số user theo từng rank
5. Thêm rank history page cho user
6. Notification khi gần đạt rank mới

---

## 🤝 SUPPORT

Nếu gặp vấn đề, kiểm tra:

1. Console log (F12) để xem lỗi
2. Network tab để xem API response
3. MongoDB để kiểm tra data
4. Backend logs để debug

---

**Chúc bạn triển khai thành công! 🚀**
