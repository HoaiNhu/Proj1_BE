# 🔐 Hướng Dẫn Cấu Hình Google OAuth 2.0

## 📋 Tổng Quan

Tài liệu này hướng dẫn bạn cách tạo Google OAuth credentials để cho phép người dùng đăng nhập/đăng ký bằng tài khoản Google.

---

## 🚀 Bước 1: Tạo Google Cloud Project

### 1.1 Truy cập Google Cloud Console

- Mở trình duyệt và truy cập: https://console.cloud.google.com/
- Đăng nhập bằng tài khoản Google của bạn

### 1.2 Tạo Project Mới

1. Click vào **Select a project** (góc trên bên trái)
2. Click **NEW PROJECT**
3. Nhập thông tin:
   - **Project name**: `Avocado Cake Shop` (hoặc tên bạn muốn)
   - **Organization**: Để mặc định (No organization)
4. Click **CREATE**
5. Đợi vài giây cho project được tạo

---

## 🔧 Bước 2: Bật Google+ API

### 2.1 Enable APIs

1. Từ menu bên trái, chọn **APIs & Services** → **Library**
2. Tìm kiếm: `Google+ API`
3. Click vào **Google+ API**
4. Click nút **ENABLE**

---

## 🎫 Bước 3: Tạo OAuth 2.0 Credentials

### 3.1 Cấu Hình OAuth Consent Screen

1. Từ menu bên trái, chọn **APIs & Services** → **OAuth consent screen**
2. Chọn **External** → Click **CREATE**
3. Điền thông tin:
   - **App name**: `Avocado Cake Shop`
   - **User support email**: Email của bạn
   - **Developer contact information**: Email của bạn
4. Click **SAVE AND CONTINUE**
5. **Scopes**: Click **SAVE AND CONTINUE** (giữ mặc định)
6. **Test users** (Optional):
   - Click **ADD USERS**
   - Thêm email của bạn để test
   - Click **SAVE AND CONTINUE**
7. Click **BACK TO DASHBOARD**

### 3.2 Tạo OAuth Client ID

1. Từ menu bên trái, chọn **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Chọn:
   - **Application type**: **Web application**
   - **Name**: `Avocado Cake Web Client`
4. **Authorized JavaScript origins**:
   - Click **+ ADD URI**
   - Thêm: `http://localhost:3000` (cho development)
   - Thêm: `http://localhost:3001` (cho backend)
   - Thêm production URL sau khi deploy (VD: `https://yourdomain.com`)
5. **Authorized redirect URIs**:
   - Click **+ ADD URI**
   - Thêm: `http://localhost:3000`
   - Thêm: `http://localhost:3001/api/auth/google/callback`
6. Click **CREATE**

### 3.3 Copy Credentials

1. Một popup sẽ hiện ra với **Client ID** và **Client Secret**
2. **QUAN TRỌNG**: Copy cả 2 giá trị này
3. Click **OK**

---

## ⚙️ Bước 4: Cấu Hình Backend (.env)

### 4.1 Mở file `.env` trong project Backend

```bash
# File: Proj1_BE/.env
```

### 4.2 Thêm Google Client ID

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
```

**Ví dụ:**

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
```

---

## 🎨 Bước 5: Cấu Hình Frontend (.env)

### 5.1 Mở file `.env` trong project Frontend

```bash
# File: FE-Project_AvocadoCake/.env
```

### 5.2 Thêm Google Client ID

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
```

**Lưu ý:**

- Sử dụng **CÙNG MỘT Google Client ID** cho cả frontend và backend
- **KHÔNG** share Client Secret trong frontend

---

## 🧪 Bước 6: Test Chức Năng

### 6.1 Khởi động Backend

```bash
cd Proj1_BE
npm start
```

### 6.2 Khởi động Frontend

```bash
cd FE-Project_AvocadoCake
npm start
```

### 6.3 Test Google Login

1. Mở trình duyệt: http://localhost:3000/login
2. Click vào button **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. Kiểm tra:
   - ✅ Được redirect về trang chủ
   - ✅ User info hiển thị đúng
   - ✅ Token được lưu trong localStorage

### 6.4 Test Google Signup

1. Mở: http://localhost:3000/signup
2. Click vào button **"Đăng ký bằng Google"**
3. Verify flow tương tự như Login

---

## 🔒 Bước 7: Production Setup

### 7.1 Update Authorized Origins & Redirect URIs

1. Quay lại Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Click vào OAuth 2.0 Client ID đã tạo
4. Thêm production URLs:
   - **Authorized JavaScript origins**:
     ```
     https://yourdomain.com
     https://api.yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://yourdomain.com
     https://api.yourdomain.com/api/auth/google/callback
     ```
5. Click **SAVE**

### 7.2 Update Environment Variables

```env
# Production Backend .env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production

# Production Frontend .env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
REACT_APP_API_URL_BACKEND=https://api.yourdomain.com/api
```

---

## ❓ Troubleshooting

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân:** URL trong request không match với Authorized redirect URIs  
**Giải pháp:**

1. Kiểm tra lại Authorized redirect URIs trong Google Console
2. Đảm bảo URL đúng format (không có trailing slash)
3. Clear browser cache và thử lại

### Lỗi: "Invalid token"

**Nguyên nhân:** Token không hợp lệ hoặc đã hết hạn  
**Giải pháp:**

1. Kiểm tra `GOOGLE_CLIENT_ID` trong backend .env
2. Đảm bảo backend đang chạy
3. Check console logs cho error details

### Lỗi: "User không có số điện thoại"

**Nguyên nhân:** Google không cung cấp phone number  
**Giải pháp:** Đã được handle - sử dụng placeholder "0000000000"

### Button Google không hiển thị

**Nguyên nhân:** Missing `REACT_APP_GOOGLE_CLIENT_ID`  
**Giải pháp:**

1. Check file `.env` có REACT_APP_GOOGLE_CLIENT_ID
2. Restart React dev server: `npm start`

---

## 📱 User Flow

### Login Flow:

```
User clicks "Đăng nhập bằng Google"
  → Google popup mở ra
  → User chọn account & cho phép
  → Frontend nhận credential token
  → Gửi token đến backend: POST /api/auth/login/google
  → Backend verify token với Google
  → Tìm hoặc tạo user mới
  → Trả về JWT access_token & refresh_token
  → Frontend lưu token & redirect về home
```

### Signup Flow:

```
User clicks "Đăng ký bằng Google"
  → Giống Login flow
  → Backend tự động tạo user mới nếu chưa tồn tại
  → Redirect về home (không cần qua login page)
```

---

## 📝 Notes

- ✅ Google account tự động tạo user với password mặc định (hash)
- ✅ User có thể đăng nhập lần sau bằng Google hoặc email/password
- ✅ Ảnh profile từ Google được lưu vào `userImage`
- ✅ Token được refresh tự động khi hết hạn
- ⚠️ Không lưu Google Client Secret trong frontend code
- ⚠️ Luôn sử dụng HTTPS trong production

---

## 🎉 Hoàn Tất!

Bây giờ ứng dụng của bạn đã hỗ trợ đăng nhập/đăng ký bằng Google Account!

**Happy Coding! 🚀**
