# Scripts Khởi Tạo Ranks

## 📋 Tổng Quan

Hệ thống có 3 ranks theo yêu cầu:

| Rank   | Icon | Điều kiện             | Giảm giá | Quyền lợi                    |
| ------ | ---- | --------------------- | -------- | ---------------------------- |
| Bronze | 🍪   | Mặc định (0đ+)        | 0%       | Quyền lợi cơ bản             |
| Silver | 🍰   | Chi tiêu ≥ 500.000đ   | 5%       | Giảm 5% đơn hàng             |
| Gold   | 🍫   | Chi tiêu ≥ 1.500.000đ | 10%      | Giảm 10% + voucher sinh nhật |

## 🚀 Cách Sử Dụng

### Phương pháp 1: Tạo trực tiếp vào Database (KHUYÊN DÙNG ⭐)

**Đơn giản nhất - Không cần token, không cần API**

```bash
cd C:\Users\Lenovo\STUDY\Proj1_BE
node scripts/create-ranks-direct.js
```

✅ Ưu điểm:

- Không cần server chạy
- Không cần access token
- Tự động xóa ranks cũ nếu có
- Nhanh nhất

### Phương pháp 2: Qua API với Interactive Input

**Cần server chạy + access token**

```bash
cd C:\Users\Lenovo\STUDY\Proj1_BE

# Chạy server trước
npm start

# Terminal khác
node scripts/init-ranks-simple.js
```

Script sẽ hỏi token (lấy từ localStorage sau khi đăng nhập)

### Phương pháp 3: Qua API với Environment Variable

```bash
# Set token trước
set ADMIN_TOKEN=your_access_token_here

# Chạy script
node scripts/init-ranks.js
```

## 📝 Chi Tiết Ranks

### 🍪 Bronze (Đồng)

```json
{
  "rankCode": "RANK_BRONZE",
  "discountPercent": 0,
  "minSpending": 0,
  "maxSpending": 499999,
  "benefits": [
    "Tích điểm thưởng cơ bản",
    "Nhận thông báo khuyến mãi",
    "Hỗ trợ khách hàng tiêu chuẩn"
  ]
}
```

### 🍰 Silver (Bạc)

```json
{
  "rankCode": "RANK_SILVER",
  "discountPercent": 5,
  "minSpending": 500000,
  "maxSpending": 1499999,
  "benefits": [
    "Giảm giá 5% cho mọi đơn hàng",
    "Tích điểm thưởng x1.5",
    "Ưu tiên hỗ trợ khách hàng",
    "Miễn phí vận chuyển cho đơn trên 200k"
  ]
}
```

### 🍫 Gold (Vàng)

```json
{
  "rankCode": "RANK_GOLD",
  "discountPercent": 10,
  "minSpending": 1500000,
  "maxSpending": null,
  "benefits": [
    "Giảm giá 10% cho mọi đơn hàng",
    "Tích điểm thưởng x2",
    "Ưu tiên hỗ trợ VIP 24/7",
    "Miễn phí vận chuyển toàn bộ đơn hàng",
    "Voucher sinh nhật đặc biệt",
    "Được mời tham gia các sự kiện đặc biệt"
  ]
}
```

## 🔧 Troubleshooting

### Lỗi: Cannot find module 'mongoose'

```bash
npm install
```

### Lỗi: Connection refused

- Kiểm tra MongoDB đang chạy
- Kiểm tra file `.env` có `MONGO_DB` đúng không

### Lỗi: 401 Unauthorized

- Đăng nhập vào http://localhost:3000/login
- Lấy token từ localStorage
- Paste vào khi script hỏi

### Xóa tất cả ranks và tạo lại

```bash
node scripts/create-ranks-direct.js
```

Script tự động xóa và tạo mới.

## 📍 API Endpoints

- `GET /api/rank/all` - Lấy tất cả ranks (public)
- `POST /api/rank/create` - Tạo rank mới (cần auth)
- `POST /api/rank/initialize` - Khởi tạo 3 ranks mặc định (cần auth)

## 🎯 Sau Khi Chạy Script

1. Kiểm tra tại: http://localhost:3000/admin/rank
2. Tất cả user mới sẽ tự động có rank Bronze
3. Khi user đặt hàng, rank sẽ tự động được cập nhật dựa trên `totalSpending`

## 💡 Tips

- Chỉ cần chạy script 1 lần khi setup project
- Nếu muốn thay đổi ranks, sửa trong `RankService.js` > `initializeDefaultRanks()`
- Rank được áp dụng tự động khi user đặt hàng thành công
