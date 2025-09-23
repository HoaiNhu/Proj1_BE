# Cập nhật Authentication cho Search History

## ✅ Đã hoàn thành

### 1. Cập nhật SearchHistoryRouter

- ✅ Import `authUserTokenMiddleware` từ `../middleware/authMiddleware`
- ✅ Thay thế mock authenticate bằng `authUserTokenMiddleware` thực tế
- ✅ Áp dụng authentication cho tất cả endpoints cần thiết

### 2. Cập nhật Frontend APIClient

- ✅ Thay đổi header từ `Token` thành `token` (lowercase) để khớp với middleware
- ✅ Giữ format `Bearer ${jwtToken}` như middleware mong đợi

## 📋 Endpoints với Authentication

### Endpoints YÊU CẦU authentication:

- `POST /api/search-history` - Lưu lịch sử (cần user login)
- `GET /api/search-history` - Lấy lịch sử cá nhân (cần user login)
- `GET /api/search-history/suggestions` - Gợi ý cá nhân (cần user login)
- `DELETE /api/search-history/:id` - Xóa lịch sử cá nhân (cần user login)
- `DELETE /api/search-history/clear` - Xóa tất cả lịch sử (cần user login)

### Endpoints KHÔNG cần authentication:

- `GET /api/search-history/popular` - Từ khóa phổ biến (public)

## 🔐 Token Format

Frontend sẽ gửi token qua header:

```javascript
headers: {
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Middleware sẽ:

1. Lấy token từ `req.headers.token`
2. Split để lấy phần sau "Bearer "
3. Verify với `process.env.ACCESS_TOKEN`
4. Gán thông tin user vào `req.user` với structure:
   ```javascript
   req.user = {
     id: user._id,
     userName: user.userName,
     email: user.email,
     isAdmin: user.isAdmin,
   };
   ```

## 🚀 Cách test

### 1. Test với user đã login

```javascript
// Đảm bảo có token trong localStorage
localStorage.setItem("accessToken", "your-jwt-token-here");

// Sau đó sử dụng SearchBox component bình thường
// Component sẽ tự động gửi token qua APIClient
```

### 2. Test với user chưa login

```javascript
// Xóa token
localStorage.removeItem("accessToken");

// Khi search sẽ nhận lỗi 401 "Không tìm thấy token"
// Component sẽ vẫn cho phép search nhưng không lưu lịch sử
```

## 🎯 Tính năng hoạt động

✅ **Với user đã login:**

- Tự động lưu lịch sử khi search
- Hiển thị gợi ý từ lịch sử cá nhân
- Có thể xóa lịch sử cá nhân

✅ **Với user chưa login:**

- Vẫn có thể search bình thường
- Không lưu lịch sử
- Không có gợi ý cá nhân
- Vẫn xem được từ khóa phổ biến

## 💡 Error Handling

Frontend SearchHistoryService đã handle gracefully:

- Nếu save history fail → vẫn cho phép search
- Nếu get suggestions fail → không hiện suggestions
- Không block user experience khi có lỗi authentication

## 🔧 Integration với main app

Thêm vào file main của Express app:

```javascript
const searchHistoryRouter = require("./routes/SearchHistoryRouter");

// Routes
app.use("/api/search-history", searchHistoryRouter);
```

Đảm bảo middleware authUserTokenMiddleware hoạt động với:

- `process.env.ACCESS_TOKEN` được set đúng
- Database connection để query User model
- JWT secret key đúng
