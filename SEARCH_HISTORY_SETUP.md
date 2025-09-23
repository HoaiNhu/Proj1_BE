# Hướng dẫn Setup Search History

## Backend Setup

### 1. Cài đặt Router trong main app

Thêm vào file `src/index.js` hoặc file chính của Express app:

```javascript
const express = require("express");
const searchHistoryRouter = require("./routes/SearchHistoryRouter");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/search-history", searchHistoryRouter);

// ... other routes
```

### 2. Cài đặt dependencies cần thiết

```bash
npm install express-validator
```

### 3. Cập nhật Authentication Middleware

Trong file `SearchHistoryRouter.js`, cần thay thế mock authentication bằng middleware thực tế:

```javascript
// Thay thế mock user này
req.user = { id: "60d5ecb74b24e3001f8b4567" };

// Bằng logic authentication thực tế, ví dụ:
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không được cung cấp",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};
```

## API Endpoints

### 1. Lưu lịch sử tìm kiếm

```
POST /api/search-history
Headers: Authorization: Bearer <token>
Body: {
  "query": "bánh ngọt"
}
```

### 2. Lấy lịch sử tìm kiếm

```
GET /api/search-history?limit=10
Headers: Authorization: Bearer <token>
```

### 3. Lấy gợi ý tìm kiếm

```
GET /api/search-history/suggestions?q=bánh&limit=5
Headers: Authorization: Bearer <token>
```

### 4. Lấy từ khóa phổ biến

```
GET /api/search-history/popular?limit=5
```

### 5. Xóa một mục lịch sử

```
DELETE /api/search-history/:id
Headers: Authorization: Bearer <token>
```

### 6. Xóa tất cả lịch sử

```
DELETE /api/search-history/clear
Headers: Authorization: Bearer <token>
```

## Frontend Setup

### 1. Cập nhật API Base URL

Kiểm tra file `APIClient.js` có đúng base URL:

```javascript
const API_URL = "http://localhost:3001"; // Hoặc URL backend của bạn
```

### 2. Cách sử dụng SearchBox Component

```jsx
import SearchBoxComponent from "./components/SearchBoxComponent/SearchBoxComponent";

const MyPage = () => {
  const handleSearch = (query) => {
    // Xử lý logic tìm kiếm
    console.log("Searching for:", query);
    // Ví dụ: navigate to search results page
    // history.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <SearchBoxComponent onSearch={handleSearch} />
    </div>
  );
};
```

## Tính năng đã triển khai

### Backend (MVC Pattern)

- ✅ **Model**: SearchHistoryModel với schema MongoDB
- ✅ **Service**: SearchHistoryService với business logic
- ✅ **Controller**: SearchHistoryController với HTTP handlers
- ✅ **Router**: SearchHistoryRouter với validation và routing

### Frontend (React)

- ✅ **Service**: SearchHistoryService để gọi API
- ✅ **Component**: SearchBoxComponent với suggestions
- ✅ **Features**:
  - Auto-save search history
  - Real-time suggestions
  - Debounced API calls
  - Error handling
  - Loading states

### Các tính năng chính:

1. **Lưu tự động**: Mỗi lần search sẽ tự động lưu vào lịch sử
2. **Gợi ý thông minh**: Hiển thị suggestions dựa trên lịch sử cá nhân
3. **Tối ưu hiệu năng**: Debounce để giảm API calls
4. **UX tốt**: Loading states, error handling graceful
5. **Security**: Validation và authentication
6. **Responsive**: CSS responsive cho mobile

## Testing

### Test Backend API

```bash
# Test save search history
curl -X POST http://localhost:3001/api/search-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"query": "bánh ngọt"}'

# Test get search history
curl -X GET http://localhost:3001/api/search-history \
  -H "Authorization: Bearer <your-token>"
```

### Test Frontend

1. Mở browser dev tools
2. Nhập từ khóa vào search box
3. Kiểm tra Network tab để xem API calls
4. Kiểm tra Console cho any errors

## Troubleshooting

### Common Issues:

1. **CORS Error**: Đảm bảo backend có setup CORS properly
2. **Authentication Error**: Kiểm tra JWT token và middleware
3. **Database Connection**: Đảm bảo MongoDB connection string đúng
4. **API Base URL**: Kiểm tra URL trong APIClient.js

### Debug Tips:

- Kiểm tra browser Console cho frontend errors
- Kiểm tra server logs cho backend errors
- Use Postman để test API endpoints riêng biệt
- Kiểm tra MongoDB collections để verify data
