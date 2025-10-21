# 🚨 FIX LỖI: Root Directory Render

## ❌ LỖI HIỆN TẠI

```
Error: Cannot find module './gOPD'
...
- /opt/render/project/src/src/index.js  ← 2 LẦN "src"
```

**Nguyên nhân:** Root Directory trong Render Dashboard bị set sai = `src`

---

## ✅ CÁCH SỬA (2 PHÚT)

### **Bước 1: Vào Render Dashboard**

1. Mở: https://dashboard.render.com
2. Click vào service: **avocado-backend**

### **Bước 2: Settings**

1. Click tab **Settings** (bên trái)
2. Scroll xuống phần **Build & Deploy**

### **Bước 3: Sửa Root Directory**

Tìm dòng:
```
Root Directory: src   ← XÓA CÁI NÀY
```

**Sửa thành:**
```
Root Directory: .
```

Hoặc **để trống** (empty)

### **Bước 4: Save**

1. Scroll xuống cuối trang
2. Click **Save Changes** (màu xanh)

### **Bước 5: Redeploy**

1. Vào tab **Manual Deploy**
2. Click **Deploy latest commit**
3. Đợi ~2-3 phút

---

## 🎯 KẾT QUẢ

Sau khi fix, logs sẽ hiện:
```
✅ Connect db successful
✅ Service is running in port: 3001
🔄 Self-ping cron job started (every 5 minutes)
```

---

## 📸 SCREENSHOT CẤU HÌNH ĐÚNG

**Root Directory:** (empty) hoặc `.`
**Build Command:** `npm install` hoặc `rm -rf node_modules && npm install`
**Start Command:** `npm start`

---

## 🔍 KIỂM TRA

Test service sau khi deploy:
```bash
curl https://avocado-backend.onrender.com/
curl https://avocado-backend.onrender.com/health
curl https://avocado-backend.onrender.com/ping
```

Tất cả phải trả về `200 OK`

---

## ⚠️ LƯU Ý

- **render.yaml** file đã đúng, không cần sửa
- Vấn đề là **Dashboard settings** override file yaml
- Nếu vẫn lỗi sau khi sửa, check:
  1. Clear build cache (Settings → Delete build cache)
  2. Manual deploy lại

---

## 🆘 NẾU VẪN LỖI

Try build command này:
```bash
npm ci --legacy-peer-deps
```

Hoặc:
```bash
rm -rf node_modules package-lock.json && npm install
```

---

**Fix xong nhớ báo tôi nhé! 🚀**
