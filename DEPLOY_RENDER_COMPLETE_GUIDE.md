# 🚀 HƯỚNG DẪN DEPLOY BACKEND LÊN RENDER - CHI TIẾT

## 📦 PHẦN 1: CHUẨN BỊ CODE

### Bước 1.1: Kiểm tra các file quan trọng

Đảm bảo có đủ các file sau:

- ✅ `package.json` - Khai báo dependencies
- ✅ `server.js` - File khởi động server
- ✅ `src/index.js` - File chính của app
- ✅ `render.yaml` - Cấu hình Render
- ✅ `.gitignore` - Loại trừ file không cần push

### Bước 1.2: Kiểm tra package.json

```json
{
  "scripts": {
    "start": "node server.js", // ← QUAN TRỌNG: Phải là server.js
    "dev": "nodemon src/index.js"
  }
}
```

### Bước 1.3: Kiểm tra .gitignore

```
.env
node_modules/
```

**LƯU Ý:** File `.env` KHÔNG được push lên Git!

---

## 🌐 PHẦN 2: TẠO TÀI KHOẢN VÀ REPO

### Bước 2.1: Đăng ký Render

1. Truy cập: https://render.com
2. Click **"Get Started"** hoặc **"Sign Up"**
3. Chọn **"Sign up with GitHub"**
4. Authorize Render truy cập GitHub

### Bước 2.2: Push code lên GitHub

```bash
# Kiểm tra trạng thái Git
git status

# Add tất cả file (trừ file trong .gitignore)
git add .

# Commit
git commit -m "Ready for deployment"

# Push lên GitHub
git push origin main
```

---

## 🎯 PHẦN 3: TẠO WEB SERVICE TRÊN RENDER

### Bước 3.1: Tạo Web Service mới

1. **Đăng nhập Render Dashboard:**

   - Truy cập: https://dashboard.render.com

2. **Click "New +"** (góc trên bên phải)

3. **Chọn "Web Service"**

4. **Connect Repository:**
   - Chọn repo: `HoaiNhu/Proj1_BE`
   - Click **"Connect"**

### Bước 3.2: Cấu hình Service

**QUAN TRỌNG: Render có 2 cách cấu hình:**

#### ✨ CÁCH 1: Dùng file `render.yaml` (Khuyến nghị)

- Render sẽ tự động đọc file `render.yaml` của bạn
- Click **"Apply"** để dùng cấu hình từ file

#### ⚙️ CÁCH 2: Cấu hình thủ công

Nếu không dùng `render.yaml`, điền thông tin:

| Field              | Value                            |
| ------------------ | -------------------------------- |
| **Name**           | `avocado-backend`                |
| **Region**         | `Singapore` (gần VN nhất)        |
| **Branch**         | `main`                           |
| **Root Directory** | _Để trống hoặc `.`_              |
| **Runtime**        | `Node`                           |
| **Build Command**  | `npm install --legacy-peer-deps` |
| **Start Command**  | `node server.js`                 |

---

## 🔐 PHẦN 4: CẤU HÌNH BIẾN MÔI TRƯỜNG (Environment Variables)

### Bước 4.1: Thêm Environment Variables

Trong **Render Dashboard** → Service của bạn → **"Environment"** tab:

Click **"Add Environment Variable"** và thêm từng biến:

#### 📌 Biến bắt buộc:

```
NODE_ENV = production
PORT = 3001
MONGO_DB = mongodb+srv://hnhu:hoainhu1234@webbuycake.asd8v.mongodb.net/?retryWrites=true&w=majority&appName=WebBuyCake
ACCESS_TOKEN = [tạo random hoặc dùng giá trị của bạn]
REFRESH_TOKEN = [tạo random hoặc dùng giá trị của bạn]
```

#### 📌 Cloudinary:

```
CLOUD_NAME = dlyl41lgq
API_KEY = 937438252781744
API_SECRET = 20KGzKbMENLmUExDempKxkjK8sM
```

#### 📌 Email (Brevo):

```
EMAIL_USER = 8772cc002@smtp-brevo.com
EMAIL_PASS = 81gcqXUDzM0bnpHB
EMAIL_FROM = avocadosweetlove@gmail.com
```

#### 📌 PayPal:

```
CLIENT_ID = ATs_2FGbTJixGASwRcxDkq45FC8gsnEMdSkOgfFxLJ1WBq2PlPduwWGvaUHmZeHZso3LeQx8tTT6lQC1
CLIENT_SECRET = EBF02U8xXfzmFq0liZAh0uWjTespUA7BYYAKt99R0PNMgNmTp_1kERmRSCAtdjdLyli2P63c558g0_50
PAYPAL_API_URL = https://api-m.sandbox.paypal.com
```

#### 📌 VietQR:

```
...
```

#### 📌 External APIs:

```
FASTAPI_URL = https://rcm-system.onrender.com
CAKE_DIFFUSION_API_URL = https://generate-img-1u0a.onrender.com
GEMINI_API_KEY = [YOUR_GEMINI_API_KEY]
OPEN_API_KEY = [YOUR_OPENAI_API_KEY]
```

### Bước 4.2: Save Changes

Click **"Save Changes"** để lưu tất cả biến môi trường.

---

## 🎬 PHẦN 5: DEPLOY

### Bước 5.1: Bắt đầu Deploy

Sau khi cấu hình xong, Render sẽ tự động:

1. Clone repo từ GitHub
2. Chạy build command: `npm install --legacy-peer-deps`
3. Chạy start command: `node server.js`

### Bước 5.2: Theo dõi Deploy Log

Trong **Dashboard** → Service → **"Logs"** tab:

- Xem quá trình build và deploy
- Kiểm tra có lỗi không

**Các dấu hiệu deploy thành công:**

```
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

### Bước 5.3: Kiểm tra URL

Render sẽ tạo URL cho bạn:

```
https://avocado-backend.onrender.com
```

---

## ✅ PHẦN 6: KIỂM TRA VÀ TEST

### Bước 6.1: Test API endpoints

```bash
# Test health check
curl https://avocado-backend.onrender.com/api/product

# Hoặc mở trình duyệt:
https://avocado-backend.onrender.com/api/product
```

### Bước 6.2: Kiểm tra MongoDB Connection

Xem trong Logs xem có kết nối được MongoDB không:

```
MongoDB connected successfully
Server is running on port 3001
```

### Bước 6.3: Test với Frontend

Update URL backend trong Frontend:

```javascript
const API_URL = "https://avocado-backend.onrender.com";
```

---

## 🐛 PHẦN 7: TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. **"Cannot find module './gOPD'"**

**Nguyên nhân:** Cache hoặc root directory sai

**Giải pháp:**

```yaml
# Trong render.yaml
rootDir: .
buildCommand: |
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
```

#### 2. **"Build failed"**

**Kiểm tra:**

- Node version trong package.json
- Dependencies có đúng không
- Build command có chạy được không

#### 3. **"Service unavailable"**

**Kiểm tra:**

- Environment variables đã đủ chưa
- MongoDB connection string có đúng không
- Port có đúng là 3001 không

#### 4. **"Free instance will spin down with inactivity"**

**Lưu ý:**

- Free plan của Render sẽ tắt sau 15 phút không hoạt động
- Cần 30-60s để khởi động lại khi có request mới
- Dùng cron job để keep alive (xem KEEP_ALIVE_GUIDE.md)

---

## 🔄 PHẦN 8: CẬP NHẬT SAU KHI DEPLOY

### Khi có thay đổi code:

```bash
# 1. Commit changes
git add .
git commit -m "Update feature X"

# 2. Push lên GitHub
git push origin main

# 3. Render tự động deploy lại
# Theo dõi tại Dashboard → Logs
```

### Manual Deploy:

Trong Dashboard → Service → Click **"Manual Deploy"** → **"Clear build cache & deploy"**

---

## 📊 PHẦN 9: MONITORING

### Xem Logs:

Dashboard → Service → **"Logs"** tab

### Xem Metrics:

Dashboard → Service → **"Metrics"** tab

- CPU usage
- Memory usage
- Request count

### Health Checks:

Render tự động ping: `/api/product` mỗi vài phút

---

## 💰 PHẦN 10: UPGRADE (Nếu cần)

### Free Plan:

- ✅ 750 giờ/tháng
- ❌ Sleep sau 15 phút
- ❌ 512 MB RAM
- ❌ Shared CPU

### Paid Plan ($7/month):

- ✅ Luôn online
- ✅ 1 GB RAM
- ✅ Dedicated CPU
- ✅ Faster builds

---

## 🎉 HOÀN TẤT!

Backend đã được deploy thành công!

**URL của bạn:**

```
https://avocado-backend.onrender.com
```

**Các bước tiếp theo:**

1. ✅ Test tất cả API endpoints
2. ✅ Kết nối với Frontend
3. ✅ Setup keep-alive (nếu dùng free plan)
4. ✅ Monitor logs thường xuyên

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. Kiểm tra Logs trên Render
2. Xem file troubleshooting trong repo
3. Render Docs: https://render.com/docs

**Happy Coding! 🚀**
