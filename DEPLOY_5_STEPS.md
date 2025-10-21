# 🚀 DEPLOY NHANH - 5 BƯỚC

## ✅ Đã Hoàn Thành (Local)

- ✅ Code chuẩn bị xong
- ✅ Environment variables OK (23/23)
- ✅ MongoDB connection OK (25 collections)
- ✅ Health check endpoints added
- ✅ CORS configured
- ✅ Scripts ready

---

## 🎯 5 BƯỚC DEPLOY LÊN RENDER

### 1️⃣ PUSH CODE LÊN GITHUB

```bash
git add .
git commit -m "feat: prepare for Render deployment"
git push origin main
```

### 2️⃣ TẠO WEB SERVICE TRÊN RENDER

1. Vào: https://render.com
2. **New +** → **Web Service**
3. Connect repo: **HoaiNhu/Proj1_BE**
4. **Name**: `avocado-backend`
5. **Region**: `Singapore`
6. **Branch**: `main`

### 3️⃣ CẤU HÌNH BUILD

- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (hoặc Starter)

### 4️⃣ THÊM ENVIRONMENT VARIABLES

**Click "Advanced" → "Add Environment Variable"**

**⚠️ QUAN TRỌNG: Generate secrets mới!**

```bash
npm run generate-secrets
```

**Thêm các biến sau:**

```
PORT=3001
NODE_ENV=production
MONGO_DB=mongodb+srv://hnhu:hoainhu1234@webbuycake.asd8v.mongodb.net/?retryWrites=true&w=majority&appName=WebBuyCake

# ⚠️ DÙNG SECRETS MỚI TỪ npm run generate-secrets
ACCESS_TOKEN=<paste_từ_generate-secrets>
REFRESH_TOKEN=<paste_từ_generate-secrets>

CLOUD_NAME=dlyl41lgq
API_KEY=937438252781744
API_SECRET=20KGzKbMENLmUExDempKxkjK8sM

EMAIL_USER=8772cc002@smtp-brevo.com
EMAIL_PASS=81gcqXUDzM0bnpHB
EMAIL_FROM=avocadosweetlove@gmail.com

CLIENT_ID=ATs_2FGbTJixGASwRcxDkq45FC8gsnEMdSkOgfFxLJ1WBq2PlPduwWGvaUHmZeHZso3LeQx8tTT6lQC1
CLIENT_SECRET=EBF02U8xXfzmFq0liZAh0uWjTespUA7BYYAKt99R0PNMgNmTp_1kERmRSCAtdjdLyli2P63c558g0_50
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

VIETQR_API_KEY=2d5d7e3d-49cc-4bf7-824c-e54fc62d983a
VIETQR_CLIENT_ID=716bc348-6b8d-4f20-a9b9-d81f17b1167b
BANK_BIN=970415
BANK_NAME=VietinBank
BANK_ACCOUNT_NUMBER=108874196741
BANK_ACCOUNT_NAME=NGUYEN HOAI NHU

FASTAPI_URL=https://rcm-system.onrender.com
CAKE_DIFFUSION_API_URL=https://generate-img-1u0a.onrender.com

GEMINI_API_KEY=<your_gemini_api_key_here>
OPEN_API_KEY=<your_openai_api_key_here>
```

### 5️⃣ DEPLOY!

Click **"Create Web Service"** → Chờ deploy xong!

---

## ✅ SAU KHI DEPLOY

### Lấy URL

```
https://avocado-backend.onrender.com
```

### Test API

```bash
curl https://avocado-backend.onrender.com/health
curl https://avocado-backend.onrender.com/
curl https://avocado-backend.onrender.com/api/product
```

### MongoDB Network Access

1. Vào: https://cloud.mongodb.com
2. **Network Access** → **Add IP Address**
3. Chọn: **Allow Access from Anywhere** (0.0.0.0/0)
4. Save

### Update Frontend

```javascript
// Frontend .env hoặc config
const API_URL = "https://avocado-backend.onrender.com";
```

---

## 🐛 TROUBLESHOOTING

### ❌ Build Failed

→ Check Render logs
→ Verify `npm install` works locally

### ❌ MongoDB Connection Failed

→ Add IP 0.0.0.0/0 trong MongoDB Atlas

### ❌ CORS Error

→ Update CORS origins trong `src/index.js`
→ Add frontend URL vào allowedOrigins

### ❌ Service Sleep (Free Plan)

→ Sau 15 phút không dùng sẽ sleep
→ Wake up time: ~30s
→ Solution: Dùng UptimeRobot hoặc upgrade plan

---

## 📚 XEM THÊM

- **Chi tiết đầy đủ**: `RENDER_DEPLOYMENT_GUIDE.md`
- **Checklist**: `PRE_DEPLOYMENT_CHECKLIST.md`
- **Summary**: `DEPLOYMENT_SUMMARY.md`

---

**Chúc bạn deploy thành công! 🎉**
