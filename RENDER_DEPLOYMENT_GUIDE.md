# 🚀 Hướng dẫn Deploy Proj1_BE lên Render

## 📋 Checklist Trước Khi Deploy

- ✅ MongoDB Atlas đã setup (đang dùng)
- ✅ Cloudinary account (đang dùng)
- ✅ PayPal sandbox credentials (đang dùng)
- ✅ Email service (Brevo SMTP - đang dùng)
- ✅ External APIs: FastAPI, Cake Diffusion, Gemini (đang dùng)
- ⚠️ Cần cập nhật CORS origin sau khi có URL Render

## 🔧 Bước 1: Chuẩn bị Code

### 1.1. Cập nhật `package.json`

Script `start` đã được sửa từ `nodemon` → `node` để production:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

### 1.2. Thêm `.gitignore` (đã có)

Đảm bảo `.env` được ignore ✅

### 1.3. Cập nhật CORS (sẽ update sau khi có URL)

File `src/index.js` cần cập nhật CORS origin sau khi có Render URL.

## 🌐 Bước 2: Tạo Web Service trên Render

### 2.1. Đăng nhập Render

1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub account
3. Click **"New +"** → **"Web Service"**

### 2.2. Connect Repository

1. Chọn repository: **HoaiNhu/Proj1_BE**
2. Click **"Connect"**

### 2.3. Cấu hình Web Service

**Basic Settings:**

- **Name**: `avocado-backend` (hoặc tên bạn muốn)
- **Region**: `Singapore` (gần VN nhất)
- **Branch**: `main`
- **Root Directory**: `.` (để trống)

**Build & Deploy:**

- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**

- **Plan**: `Free` (hoặc `Starter` nếu cần hiệu năng cao)

### 2.4. Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Thêm tất cả các biến từ file `.env`:

```bash
# Server
PORT=3001
NODE_ENV=production

# Database
MONGO_DB=mongodb+srv://hnhu:hoainhu1234@webbuycake.asd8v.mongodb.net/?retryWrites=true&w=majority&appName=WebBuyCake

# JWT Secrets (NÊN ĐỔI TRONG PRODUCTION!)
ACCESS_TOKEN=your_super_secret_access_token_here_change_this
REFRESH_TOKEN=your_super_secret_refresh_token_here_change_this

# Cloudinary
CLOUD_NAME=dlyl41lgq
API_KEY=937438252781744
API_SECRET=20KGzKbMENLmUExDempKxkjK8sM

# Email (Brevo SMTP)
EMAIL_USER=8772cc002@smtp-brevo.com
EMAIL_PASS=81gcqXUDzM0bnpHB
EMAIL_FROM=avocadosweetlove@gmail.com

# PayPal
CLIENT_ID=ATs_2FGbTJixGASwRcxDkq45FC8gsnEMdSkOgfFxLJ1WBq2PlPduwWGvaUHmZeHZso3LeQx8tTT6lQC1
CLIENT_SECRET=EBF02U8xXfzmFq0liZAh0uWjTespUA7BYYAKt99R0PNMgNmTp_1kERmRSCAtdjdLyli2P63c558g0_50
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# VietQR
VIETQR_API_KEY=2d5d7e3d-49cc-4bf7-824c-e54fc62d983a
VIETQR_CLIENT_ID=716bc348-6b8d-4f20-a9b9-d81f17b1167b
BANK_BIN=970415
BANK_NAME=VietinBank
BANK_ACCOUNT_NUMBER=108874196741
BANK_ACCOUNT_NAME=NGUYEN HOAI NHU

# External APIs
FASTAPI_URL=https://rcm-system.onrender.com
CAKE_DIFFUSION_API_URL=https://generate-img-1u0a.onrender.com

# AI APIs
GEMINI_API_KEY=<your_gemini_api_key_here>
OPEN_API_KEY=<your_openai_api_key_here>
```

### 2.5. Click "Create Web Service"

Render sẽ bắt đầu build và deploy!

## ✅ Bước 3: Sau Khi Deploy Thành Công

### 3.1. Lấy URL Render

Sau khi deploy xong, bạn sẽ có URL dạng:

```
https://avocado-backend.onrender.com
```

### 3.2. Test API

```bash
# Test health check
curl https://avocado-backend.onrender.com/api/user

# Test specific endpoint
curl https://avocado-backend.onrender.com/api/product
```

### 3.3. Cập nhật CORS trong code

Sau khi có URL Render, cần cập nhật file `src/index.js`:

```javascript
app.use(
  cors({
    origin: [
      "https://avocado-app.onrender.com", // Frontend production
      "http://localhost:3000", // Local development
      "http://localhost:3100", // Local development alt
    ],
    credentials: true,
  })
);
```

Push code lại lên GitHub, Render sẽ tự động re-deploy.

### 3.4. Cập nhật Frontend

Trong Frontend project, cập nhật API URL:

```javascript
// .env hoặc config
REACT_APP_API_URL=https://avocado-backend.onrender.com
```

### 3.5. Whitelist IP trong MongoDB Atlas

1. Truy cập MongoDB Atlas
2. Vào **Network Access**
3. Click **"Add IP Address"**
4. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Hoặc thêm IP của Render (check trong Render logs)

## 🔍 Bước 4: Monitoring & Debugging

### 4.1. Xem Logs

Trong Render Dashboard:

- Click vào service
- Tab **"Logs"** để xem real-time logs
- Kiểm tra lỗi kết nối MongoDB, CORS, etc.

### 4.2. Common Issues

**❌ MongoDB Connection Failed:**

```
Solution: Whitelist 0.0.0.0/0 trong MongoDB Atlas Network Access
```

**❌ CORS Error:**

```
Solution: Thêm Render URL vào CORS origins
```

**❌ Environment Variables Missing:**

```
Solution: Double-check tất cả env vars trong Render Dashboard
```

**❌ Service Sleep (Free Plan):**

```
Problem: Free plan sleep sau 15 phút không dùng
Solution:
- Upgrade to paid plan
- Hoặc dùng UptimeRobot để ping mỗi 5 phút
```

### 4.3. Health Check Endpoint

Thêm health check endpoint (optional):

```javascript
// src/index.js
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

## 🚀 Bước 5: Tối Ưu Performance

### 5.1. Enable Compression

```bash
npm install compression
```

```javascript
// src/index.js
const compression = require("compression");
app.use(compression());
```

### 5.2. Rate Limiting (Optional)

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

### 5.3. Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");
app.use(helmet());
```

## 📊 Bước 6: Setup CI/CD

Render tự động deploy khi push lên GitHub:

1. **Auto-Deploy**: Bật trong Render Settings
2. **Branch**: Deploy từ branch `main`
3. **Notifications**: Setup Discord/Slack webhook

## 🎯 Bước 7: Custom Domain (Optional)

1. Trong Render Dashboard → **Settings**
2. **Custom Domain** → Add domain
3. Cập nhật DNS records theo hướng dẫn
4. Render tự động cấp SSL certificate

## 📝 Checklist Cuối Cùng

- [ ] ✅ Service deploy thành công
- [ ] ✅ MongoDB connected
- [ ] ✅ CORS configured đúng
- [ ] ✅ Environment variables đầy đủ
- [ ] ✅ API endpoints hoạt động
- [ ] ✅ Frontend connect được backend
- [ ] ✅ Cron job (Daily Puzzle) chạy đúng
- [ ] ✅ External APIs (FastAPI, Gemini) hoạt động
- [ ] ✅ PayPal integration hoạt động
- [ ] ✅ Email service hoạt động

## 🆘 Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com

## 💡 Tips

1. **Free Plan Limitations:**

   - Service sleep sau 15 phút inactive
   - 750 hours/month free
   - Cold start ~30s khi wake up

2. **Paid Plan Benefits:**

   - No sleep
   - Faster performance
   - More resources
   - Custom domains

3. **Cost Optimization:**
   - Dùng Render cho backend
   - Dùng Vercel/Netlify cho frontend (free)
   - MongoDB Atlas free tier (512MB)

---

**🎉 Chúc bạn deploy thành công!**

Nếu gặp vấn đề, check logs trong Render Dashboard hoặc hỏi lại nhé! 😊
