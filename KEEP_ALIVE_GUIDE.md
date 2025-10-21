# 🔄 Keep Render Service Alive - Hướng dẫn

## Vấn đề với Render Free Tier

Render Free Plan có giới hạn:

- Service **sleep sau 15 phút** không có activity
- **Cold start ~30 giây** khi service wake up lại
- 750 giờ miễn phí/tháng

## ✅ Giải pháp đã triển khai

### 1. **Self-Ping với Cron Job (Đã có trong code)**

Backend tự động ping chính nó mỗi 5 phút khi chạy trong production.

**Endpoint ping:**

```
GET /ping
```

**Response:**

```json
{
  "status": "OK",
  "message": "Pong! Service is alive",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "uptime": 3600
}
```

**Cron schedule:** Chạy mỗi 5 phút (`*/5 * * * *`)

**Code trong `src/index.js`:**

```javascript
// Self-ping mỗi 5 phút để keep service alive
if (process.env.NODE_ENV === "production") {
  const SERVICE_URL =
    process.env.RENDER_EXTERNAL_URL || "https://avocado-backend.onrender.com";

  cron.schedule("*/5 * * * *", async () => {
    try {
      const response = await axios.get(`${SERVICE_URL}/ping`);
      console.log(`✅ Self-ping successful: ${response.data.message}`);
    } catch (err) {
      console.error(`❌ Self-ping failed:`, err.message);
    }
  });
}
```

**Lưu ý:**

- ✅ Không cần setup gì thêm, tự động chạy trong production
- ✅ Check logs trong Render Dashboard để xem ping status
- ⚠️ Nếu service crash, self-ping sẽ không hoạt động

---

## 🌐 Giải pháp 2: UptimeRobot (External - Recommended)

**UptimeRobot** là service monitoring miễn phí, ping service từ bên ngoài.

### **Ưu điểm:**

- ✅ Hoạt động ngay cả khi service crash
- ✅ Monitoring uptime và gửi alert
- ✅ Dashboard đẹp để theo dõi
- ✅ Miễn phí cho 50 monitors

### **Setup UptimeRobot:**

#### Bước 1: Đăng ký tài khoản

1. Vào: https://uptimerobot.com
2. **Sign Up** (Free)
3. Verify email

#### Bước 2: Tạo Monitor

1. Click **"+ Add New Monitor"**
2. Cấu hình:

**Monitor Type:**

```
HTTP(s)
```

**Friendly Name:**

```
Avocado Backend - Render
```

**URL (or IP):**

```
https://avocado-backend.onrender.com/ping
```

**Monitoring Interval:**

```
Every 5 minutes
```

**Monitor Timeout:**

```
30 seconds
```

**Alert Contacts:**

- Nhập email của bạn để nhận thông báo khi service down

#### Bước 3: Save

Click **"Create Monitor"**

### **Kết quả:**

- ✅ UptimeRobot sẽ ping service mỗi 5 phút
- ✅ Service luôn active, không bao giờ sleep
- ✅ Nhận email nếu service down

---

## 🔧 Giải pháp 3: Cron-Job.org (Alternative)

Nếu không muốn dùng UptimeRobot, có thể dùng **Cron-Job.org**:

1. Vào: https://cron-job.org
2. Sign up (Free)
3. **Create cronjob:**
   - **URL**: `https://avocado-backend.onrender.com/ping`
   - **Schedule**: `Every 5 minutes`
   - **Method**: `GET`

---

## 📊 So sánh các giải pháp

| Giải pháp                | Ưu điểm                                                          | Nhược điểm                                                      |
| ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| **Self-Ping (Internal)** | • Không cần setup thêm<br>• Tự động                              | • Không hoạt động nếu service crash<br>• Dùng tài nguyên server |
| **UptimeRobot**          | • Monitoring từ bên ngoài<br>• Alert khi down<br>• Dashboard đẹp | • Cần đăng ký account                                           |
| **Cron-Job.org**         | • Đơn giản<br>• Miễn phí                                         | • Ít tính năng hơn UptimeRobot                                  |

---

## ✅ Khuyến nghị

**Dùng kết hợp cả 2:**

1. ✅ **Self-Ping** (đã có sẵn) - Backup solution
2. ✅ **UptimeRobot** - Primary monitoring

**Setup thời gian:**

- Self-Ping: Mỗi 5 phút
- UptimeRobot: Mỗi 5 phút (offset 2.5 phút)

Như vậy service được ping **mỗi ~2-3 phút** → Không bao giờ sleep!

---

## 🧪 Test Self-Ping

### Test local:

```bash
curl http://localhost:3001/ping
```

### Test production:

```bash
curl https://avocado-backend.onrender.com/ping
```

**Expected response:**

```json
{
  "status": "OK",
  "message": "Pong! Service is alive",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "uptime": 3600
}
```

---

## 📝 Environment Variables cần thiết

Thêm vào Render Dashboard → Environment Variables:

```bash
# Production mode để enable self-ping
NODE_ENV=production

# Optional: URL của service (tự động detect nếu không set)
RENDER_EXTERNAL_URL=https://avocado-backend.onrender.com
```

---

## 🔍 Check Logs

Trong Render Dashboard → Logs, bạn sẽ thấy:

```
✅ Self-ping successful at 2025-10-21T10:05:00.000Z: Pong! Service is alive
✅ Self-ping successful at 2025-10-21T10:10:00.000Z: Pong! Service is alive
✅ Self-ping successful at 2025-10-21T10:15:00.000Z: Pong! Service is alive
```

Nếu thấy errors:

```
❌ Self-ping failed at 2025-10-21T10:20:00.000Z: connect ECONNREFUSED
```

→ Check xem service có đang chạy không

---

## 💰 Cost Estimation

**Với Free Plan (750 giờ/tháng):**

- 30 ngày × 24 giờ = 720 giờ
- **Kết luận:** Đủ để chạy 24/7 cả tháng! ✅

**Nếu vượt quá:**

- Upgrade to Starter Plan ($7/month)
- Unlimited hours
- No sleep

---

## 🎉 Tóm tắt

1. ✅ **Backend đã có self-ping** - Không cần làm gì thêm
2. ✅ **Setup UptimeRobot** - 5 phút setup, monitoring forever
3. ✅ **Service luôn online** - Happy users! 😊

---

**Good luck! 🚀**
