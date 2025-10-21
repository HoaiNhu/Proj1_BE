# ✅ CHECKLIST DEPLOY RENDER - NGẮN GỌN

## 📝 TRƯỚC KHI DEPLOY

### 1. Kiểm tra Code

- [ ] File `server.js` tồn tại ở root
- [ ] File `package.json` có script: `"start": "node server.js"`
- [ ] File `.gitignore` có `.env` và `node_modules/`
- [ ] File `render.yaml` có cấu hình đúng
- [ ] Code đã commit và push lên GitHub

### 2. Test Local

```bash
npm install
npm start
# Truy cập: http://localhost:3001
```

---

## 🚀 TRÊN RENDER DASHBOARD

### Bước 1: Tạo Web Service

1. Đăng nhập: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect repo: `HoaiNhu/Proj1_BE`
4. Click **"Connect"**

### Bước 2: Cấu hình (nếu không dùng render.yaml)

- **Name:** `avocado-backend`
- **Region:** `Singapore`
- **Branch:** `main`
- **Root Directory:** Để trống
- **Build Command:** `npm install --legacy-peer-deps`
- **Start Command:** `node server.js`

### Bước 3: Thêm Environment Variables

Click **"Add Environment Variable"** và copy-paste tất cả biến từ file `.env` local:

```
NODE_ENV = production
PORT = 3001
MONGO_DB = mongodb+srv://...
ACCESS_TOKEN = ...
REFRESH_TOKEN = ...
CLOUD_NAME = ...
API_KEY = ...
API_SECRET = ...
EMAIL_USER = ...
EMAIL_PASS = ...
EMAIL_FROM = ...
CLIENT_ID = ...
CLIENT_SECRET = ...
PAYPAL_API_URL = https://api-m.sandbox.paypal.com
VIETQR_API_KEY = ...
VIETQR_CLIENT_ID = ...
BANK_BIN = 970415
BANK_NAME = VietinBank
BANK_ACCOUNT_NUMBER = ...
BANK_ACCOUNT_NAME = ...
FASTAPI_URL = https://rcm-system.onrender.com
CAKE_DIFFUSION_API_URL = https://generate-img-1u0a.onrender.com
GEMINI_API_KEY = ...
OPEN_API_KEY = ...
```

### Bước 4: Deploy

- Click **"Create Web Service"**
- Chờ deploy (3-5 phút)
- Xem Logs để theo dõi

---

## ✅ SAU KHI DEPLOY

### Kiểm tra Deploy thành công

- [ ] Log hiện: `==> Your service is live 🎉`
- [ ] Status: **"Live"** (màu xanh)
- [ ] Có URL: `https://avocado-backend.onrender.com`

### Test API

```bash
# Mở trình duyệt hoặc dùng curl
https://avocado-backend.onrender.com/api/product
```

### Kết nối Frontend

Sửa API URL trong Frontend:

```javascript
const API_URL = "https://avocado-backend.onrender.com";
```

---

## 🐛 NẾU GẶP LỖI

### Lỗi "Cannot find module"

```bash
# Trong render.yaml, thêm vào buildCommand:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Service không start

1. Kiểm tra Logs
2. Kiểm tra Environment Variables
3. Kiểm tra MongoDB connection string

### Chạy chậm/timeout

- Free plan sẽ sleep sau 15 phút
- Request đầu tiên sẽ mất 30-60s để wake up
- Setup keep-alive (xem KEEP_ALIVE_GUIDE.md)

---

## 🔄 CẬP NHẬT CODE

Mỗi khi có thay đổi:

```bash
git add .
git commit -m "Update xyz"
git push
# Render tự động deploy lại
```

---

## 📞 LINKS HỮU ÍCH

- **Dashboard:** https://dashboard.render.com
- **Your Service:** https://dashboard.render.com/web/[your-service-id]
- **Docs:** https://render.com/docs
- **API URL:** https://avocado-backend.onrender.com

---

**🎉 DONE! Backend đã live!**
