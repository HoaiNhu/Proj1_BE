# 🍪 Cookie & Refresh Token Setup - Testing Guide

## ✅ Các thay đổi đã thực hiện:

### Backend (Proj1_BE/src/controllers/UserController.js):

1. ✅ Cookie settings updated với `sameSite: "Lax"` cho localhost
2. ✅ Thêm logging để debug cookie flow
3. ✅ `maxAge: 365 days` - cookie tồn tại 1 năm
4. ✅ `httpOnly: true` - bảo mật, không access từ JavaScript
5. ✅ `secure: false` trong dev - cho phép HTTP

### Frontend (FE-Project_AvocadoCake/src/app/api/services/UserService.js):

1. ✅ `loginUser` có `withCredentials: true`
2. ✅ `logoutUser` có `withCredentials: true`
3. ✅ `refreshToken` đã có `withCredentials: true`
4. ✅ Loại bỏ localStorage.removeItem("refresh_token")

---

## 🧪 Cách test:

### Bước 1: Restart Backend

```bash
cd c:\Users\Lenovo\STUDY\Proj1_BE
# Stop server hiện tại (Ctrl+C)
npm run dev
```

### Bước 2: Clear Browser Data

1. Mở DevTools (F12)
2. Application → Cookies → Delete all cookies cho localhost
3. Application → Local Storage → Clear
4. Close và mở lại browser

### Bước 3: Test Login Flow

1. Mở http://localhost:3000
2. Đăng nhập với tài khoản test
3. Check console backend - phải thấy:

```
🍪 Setting refresh_token cookie: {
  isProduction: false,
  cookieLength: XXX,
  origin: 'http://localhost:3000'
}
```

### Bước 4: Check Cookie trong Browser

1. F12 → Application → Cookies → http://localhost:3001
2. Phải thấy cookie `refresh_token` với:
   - Value: jwt token dài
   - HttpOnly: ✓
   - Secure: (empty/false)
   - SameSite: Lax
   - Path: /
   - Expires: 1 năm sau

### Bước 5: Test Refresh Token

1. Đợi 10 phút (access_token expires)
2. Navigate trang hoặc trigger API call
3. Check Network tab → POST /api/user/refresh-token
4. Check request Headers → Cookie section phải có `refresh_token=xxx`
5. Check backend console:

```
🔄 Refresh token request:
  - req.cookies: [Object: null prototype] { refresh_token: 'eyJhbGc...' }
  - req.cookies.refresh_token: eyJhbGc...
  - req.headers.cookie: refresh_token=eyJhbGc...
  - req.headers.origin: http://localhost:3000
```

---

## ❌ Troubleshooting:

### Vấn đề: Cookie không được gửi

**Nguyên nhân:**

- Frontend không có `withCredentials: true` ✅ (đã fix)
- Backend không có CORS `credentials: true` ✅ (đã có)
- Cookie `SameSite` setting sai ✅ (đã fix thành "Lax")

**Giải pháp:**

- ✅ Đã apply tất cả fixes
- Restart backend để áp dụng changes
- Clear cookies và test lại

### Vấn đề: req.cookies = {}

**Nguyên nhân:**

- `cookie-parser` middleware chưa được load ✅ (đã có)
- Cookie không được browser gửi lên
- Cookie domain/path không match

**Giải pháp:**

- Check DevTools → Network → request có Cookie header không
- Check Cookie path = "/"
- Ensure frontend gọi API với `withCredentials: true`

### Vấn đề: Token expires quá nhanh

**Current Settings:**

- Access Token: 10 minutes (normal)
- Refresh Token: 365 days (trong cookie)

**Auto Refresh:**

- Frontend tự động refresh access token trước 1 phút khi sắp hết hạn
- Xem App.js useEffect setupAutoRefresh()

---

## 🎯 Expected Behavior:

1. **Login:**

   - User login → Backend set cookie `refresh_token`
   - Cookie tự động lưu trong browser (httpOnly)
   - Access token lưu trong localStorage

2. **Auto Refresh:**

   - Access token sắp hết hạn (còn 1 phút)
   - Frontend tự động gọi `/refresh-token` với cookie
   - Backend đọc cookie, verify và tạo access token mới
   - Update localStorage với token mới

3. **Logout:**
   - Call `/log-out` → Backend xóa cookie
   - Clear localStorage access_token
   - Redirect về login

---

## 📝 Files Changed:

1. `Proj1_BE/src/controllers/UserController.js`

   - loginUser() - cookie settings
   - logoutUser() - clearCookie settings
   - refreshToken() - debug logging

2. `FE-Project_AvocadoCake/src/app/api/services/UserService.js`

   - loginUser() - added withCredentials
   - logoutUser() - added withCredentials
   - refreshToken() - already had withCredentials

3. `FE-Project_AvocadoCake/src/App.js`
   - Removed all localStorage.removeItem("refresh_token")
   - Cookie is managed by backend

---

## ✨ Next Steps:

1. **Restart backend server** - QUAN TRỌNG!
2. **Clear browser cookies/storage**
3. **Test login flow**
4. **Check backend logs** cho cookie debug info
5. **Verify cookie trong DevTools**
6. **Test refresh token** sau 10 phút

---

## 📞 Still not working?

Check:

1. Backend đang chạy port 3001?
2. Frontend đang chạy port 3000?
3. `.env` có `REACT_APP_API_URL_BACKEND=http://localhost:3001/api`?
4. Backend `.env` có `NODE_ENV=development`?
5. Cookie-parser version trong package.json?

If all else fails, show me:

- Backend console logs khi login
- Backend console logs khi refresh-token
- DevTools → Network → refresh-token request details
- DevTools → Application → Cookies screenshot
