# ✅ Pre-Deployment Checklist

## Trước khi Deploy

### 1. Code Preparation

- [x] ✅ `package.json` - Script `start` dùng `node` thay vì `nodemon`
- [x] ✅ `src/index.js` - Có health check endpoint
- [x] ✅ `src/index.js` - CORS configured đúng
- [ ] 🔄 Test local: `npm run check-env`
- [ ] 🔄 Test local: `npm run test-mongo`
- [ ] 🔄 Test local: `npm start` (không dùng nodemon)

### 2. Environment Variables

- [ ] 🔄 Đã đổi `ACCESS_TOKEN` và `REFRESH_TOKEN` (production secrets)
- [ ] 🔄 Tất cả API keys đã có
- [ ] 🔄 MongoDB connection string đúng
- [ ] 🔄 Cloudinary credentials đúng
- [ ] 🔄 PayPal credentials (sandbox hoặc live)
- [ ] 🔄 Email SMTP credentials (Brevo)

### 3. Database

- [ ] 🔄 MongoDB Atlas Network Access: Allow `0.0.0.0/0`
- [ ] 🔄 Database user có quyền read/write
- [ ] 🔄 Database name đúng

### 4. External Services

- [ ] 🔄 FastAPI service đang chạy: https://rcm-system.onrender.com
- [ ] 🔄 Cake Diffusion API đang chạy: https://generate-img-1u0a.onrender.com
- [ ] 🔄 Gemini API key còn quota
- [ ] 🔄 OpenAI API key còn quota

### 5. Git

- [ ] 🔄 `.gitignore` includes `.env`
- [ ] 🔄 Không commit `.env` file
- [ ] 🔄 Code đã push lên GitHub

---

## Render Deployment

### 1. Create Web Service

- [ ] 🔄 Repository connected: HoaiNhu/Proj1_BE
- [ ] 🔄 Branch: `main`
- [ ] 🔄 Name: `avocado-backend` (hoặc tên khác)
- [ ] 🔄 Region: `Singapore`

### 2. Build Settings

- [ ] 🔄 Runtime: `Node`
- [ ] 🔄 Build Command: `npm install`
- [ ] 🔄 Start Command: `npm start`

### 3. Environment Variables

Đã thêm tất cả variables (copy từ `.env`):

- [ ] 🔄 PORT
- [ ] 🔄 NODE_ENV=production
- [ ] 🔄 MONGO_DB
- [ ] 🔄 ACCESS_TOKEN (new secret!)
- [ ] 🔄 REFRESH_TOKEN (new secret!)
- [ ] 🔄 CLOUD_NAME
- [ ] 🔄 API_KEY
- [ ] 🔄 API_SECRET
- [ ] 🔄 EMAIL_USER
- [ ] 🔄 EMAIL_PASS
- [ ] 🔄 EMAIL_FROM
- [ ] 🔄 CLIENT_ID
- [ ] 🔄 CLIENT_SECRET
- [ ] 🔄 PAYPAL_API_URL
- [ ] 🔄 VIETQR_API_KEY
- [ ] 🔄 VIETQR_CLIENT_ID
- [ ] 🔄 BANK_BIN
- [ ] 🔄 BANK_NAME
- [ ] 🔄 BANK_ACCOUNT_NUMBER
- [ ] 🔄 BANK_ACCOUNT_NAME
- [ ] 🔄 FASTAPI_URL
- [ ] 🔄 CAKE_DIFFUSION_API_URL
- [ ] 🔄 GEMINI_API_KEY
- [ ] 🔄 OPEN_API_KEY

### 4. Deploy

- [ ] 🔄 Click "Create Web Service"
- [ ] 🔄 Wait for build to complete
- [ ] 🔄 Check logs for errors

---

## Post-Deployment

### 1. Test Endpoints

- [ ] 🔄 Health check: `https://your-service.onrender.com/health`
- [ ] 🔄 Root: `https://your-service.onrender.com/`
- [ ] 🔄 API: `https://your-service.onrender.com/api/product`
- [ ] 🔄 Auth: `https://your-service.onrender.com/api/auth/login`

### 2. Check Logs

- [ ] 🔄 "Connect db successful" message
- [ ] 🔄 "Service is running in port" message
- [ ] 🔄 No MongoDB connection errors
- [ ] 🔄 No CORS errors

### 3. Update CORS (if needed)

Nếu frontend URL thay đổi:

- [ ] 🔄 Update `allowedOrigins` trong `src/index.js`
- [ ] 🔄 Push code, auto-redeploy

### 4. Update Frontend

- [ ] 🔄 Đổi `API_URL` trong frontend config
- [ ] 🔄 Test frontend → backend connection
- [ ] 🔄 Test login/logout
- [ ] 🔄 Test API calls

### 5. Monitor

- [ ] 🔄 Setup UptimeRobot (nếu dùng free plan)
- [ ] 🔄 Check logs định kỳ
- [ ] 🔄 Monitor response times

---

## Troubleshooting Common Issues

### MongoDB Connection Failed

```
Solution:
1. MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0
3. Restart Render service
```

### CORS Error

```
Solution:
1. Check allowedOrigins array
2. Add frontend URL
3. Redeploy
```

### Environment Variable Not Found

```
Solution:
1. Render Dashboard → Environment
2. Add missing variable
3. Redeploy (manual)
```

### Service Sleep (Free Plan)

```
Solution:
1. Use UptimeRobot to ping every 5 min
2. Or upgrade to paid plan
```

### Daily Puzzle Cron Not Running

```
Solution:
1. Check logs at midnight (UTC)
2. Verify timezone in cron schedule
3. Check Product collection has data
```

---

## Performance Optimization (Optional)

- [ ] 🔄 Add compression middleware
- [ ] 🔄 Add rate limiting
- [ ] 🔄 Add helmet for security
- [ ] 🔄 Setup monitoring (New Relic, DataDog)
- [ ] 🔄 Enable auto-scaling
- [ ] 🔄 Setup custom domain

---

## Success Criteria

✅ **Deploy Thành Công Khi:**

1. Service status: `Live`
2. Health endpoint returns 200
3. API endpoints hoạt động
4. MongoDB connected
5. External APIs accessible
6. Frontend connect được backend
7. Login/Register hoạt động
8. CRUD operations hoạt động
9. File upload (Cloudinary) hoạt động
10. Email sending hoạt động

---

**Good luck! 🚀**
