# 🚀 Quick Start - Render Deployment

## Trước khi Deploy

1. **Đẩy code lên GitHub:**

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Deploy lên Render (Web Dashboard)

### Bước 1: Tạo Web Service

1. Vào https://render.com
2. New + → **Web Service**
3. Connect repository: `HoaiNhu/Proj1_BE`

### Bước 2: Cấu hình

**Basic:**

- Name: `avocado-backend`
- Region: `Singapore`
- Branch: `main`
- Runtime: `Node`

**Build & Deploy:**

- Build Command: `npm install`
- Start Command: `npm start`

### Bước 3: Environment Variables

Thêm tất cả biến từ file `.env`:

```
PORT=3001
NODE_ENV=production
MONGO_DB=mongodb+srv://...
ACCESS_TOKEN=your_secret
REFRESH_TOKEN=your_secret
... (copy tất cả từ .env)
```

⚠️ **LƯU Ý:** ĐỔI ACCESS_TOKEN và REFRESH_TOKEN trong production!

### Bước 4: Deploy

Click **"Create Web Service"** → Chờ deploy xong!

## Sau khi Deploy

### URL Service

```
https://avocado-backend.onrender.com
```

### Test API

```bash
# Health check
curl https://avocado-backend.onrender.com/health

# API test
curl https://avocado-backend.onrender.com/api/product
```

### Cập nhật Frontend

Trong frontend, đổi API URL:

```javascript
const API_URL = "https://avocado-backend.onrender.com";
```

## Troubleshooting

### MongoDB Connection Failed

- Vào MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (Allow from anywhere)

### CORS Error

- Check CORS origins trong `src/index.js`
- Thêm frontend URL vào allowedOrigins

### Service Sleep (Free Plan)

- Free plan sleep sau 15 phút inactive
- Dùng UptimeRobot để ping mỗi 5 phút
- Hoặc upgrade to paid plan ($7/month)

## Chi tiết đầy đủ

Xem file `RENDER_DEPLOYMENT_GUIDE.md` để biết hướng dẫn chi tiết!
