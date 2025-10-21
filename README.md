# 🍰 Avocado Cake Backend API

Backend API cho website bán bánh Avocado Cake, được xây dựng bằng Node.js, Express, và MongoDB.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Sau đó điền thông tin vào .env

# Check environment
npm run check-env

# Test MongoDB connection
npm run test-mongo

# Run development server
npm run dev
```

Server sẽ chạy tại: http://localhost:3001

### Production

```bash
# Generate production secrets
npm run generate-secrets

# Start production server
npm start
```

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, Google OAuth
- **Cloud Storage**: Cloudinary
- **Email**: Brevo SMTP
- **Payment**: PayPal, VietQR
- **AI/ML**:
  - Python FastAPI (Recommendations)
  - Gemini AI
  - OpenAI
  - Cake Diffusion (Image Generation)

## 🏗️ Architecture

```
src/
├── index.js           # Entry point
├── config/            # Configuration (passport, etc.)
├── routes/            # API routes
├── controllers/       # Request handlers
├── services/          # Business logic
├── models/            # MongoDB schemas
├── middleware/        # Auth, validation
├── utils/             # Helpers
└── Helper/            # Cloudinary upload
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Google OAuth

### Products

- `GET /api/product` - Lấy danh sách sản phẩm
- `GET /api/product/:id` - Chi tiết sản phẩm
- `POST /api/product` - Tạo sản phẩm (Admin)
- `PUT /api/product/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/product/:id` - Xóa sản phẩm (Admin)

### Orders

- `GET /api/order` - Lấy đơn hàng
- `POST /api/order` - Tạo đơn hàng
- `PUT /api/order/:id` - Cập nhật đơn hàng

### Quiz & Recommendations

- `GET /api/quiz` - Lấy câu hỏi quiz
- `POST /api/quiz/responses` - Lưu câu trả lời
- `GET /api/recommendation` - Gợi ý sản phẩm (ML-based)

### Search History

- `GET /api/search-history` - Lịch sử tìm kiếm
- `POST /api/search-history` - Lưu tìm kiếm
- `GET /api/search-history/suggestions` - Gợi ý tìm kiếm

### Daily Puzzle

- `GET /api/puzzle/daily` - Ô chữ hàng ngày
- `POST /api/puzzle/check` - Kiểm tra đáp án

### Others

- `GET /api/category` - Danh mục
- `GET /api/news` - Tin tức
- `GET /api/discount` - Mã giảm giá
- `POST /api/rating` - Đánh giá sản phẩm
- `POST /api/chatbot` - Chatbot AI
- `POST /api/ai` - AI services

Xem full API documentation tại [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔐 Environment Variables

Copy `.env.example` thành `.env` và điền các giá trị:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGO_DB=your_mongodb_connection_string

# JWT (Generate với: npm run generate-secrets)
ACCESS_TOKEN=your_secret_here
REFRESH_TOKEN=your_secret_here

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret

# ... và các biến khác
```

Xem full list trong `.env.example`

## 🛠️ Scripts

```bash
npm start              # Production server
npm run dev            # Development server (nodemon)
npm run check-env      # Validate environment variables
npm run test-mongo     # Test MongoDB connection
npm run generate-secrets # Generate JWT secrets
```

## 🌐 Deployment

### Deploy lên Render

Xem hướng dẫn chi tiết:

- **Quick Start**: [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)
- **Full Guide**: [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
- **Checklist**: [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

Tóm tắt:

1. Push code lên GitHub
2. Tạo Web Service trên Render
3. Connect repository
4. Set environment variables
5. Deploy!

## 🎮 Features

### Core Features

- ✅ User authentication (JWT + Google OAuth)
- ✅ Product management (CRUD)
- ✅ Order processing
- ✅ Payment integration (PayPal, VietQR)
- ✅ Image upload (Cloudinary)
- ✅ Email notifications

### Smart Features

- 🤖 **AI Recommendations** - ML-based product suggestions
- 🎯 **Quiz System** - Personalized product matching
- 🔍 **Smart Search** - History & suggestions
- 🧩 **Daily Puzzle** - Gamification (auto-generated)
- 💬 **AI Chatbot** - Customer support
- ⭐ **Rating System** - User reviews

### Background Jobs

- 🕐 **Cron Job** - Daily puzzle generation (00:00)
- 📊 **Analytics** - View tracking
- 🔄 **ML Model** - Auto-update from interactions

## 🔒 Security

- JWT-based authentication
- Password hashing (bcrypt)
- Environment variable protection
- CORS configuration
- Input validation (express-validator)
- Rate limiting (recommended)
- Helmet security headers (recommended)

## 📊 Database Collections

**Main Collections:**

- `users` - User accounts
- `products` - Product catalog
- `orders` - Order history
- `categories` - Product categories
- `quizzes` - Quiz questions
- `userquizresponses` - Quiz answers
- `searchhistories` - Search logs
- `dailypuzzles` - Daily puzzles
- `ratings` - Product reviews
- `userassets` - User points/coins

**Supporting Collections:**

- `cities`, `districts`, `wards` - Address data
- `news` - News articles
- `discounts` - Discount codes
- `payments` - Payment records
- `aigenerations` - AI content
- `recommendations` - ML data

## 🧪 Testing

```bash
# Check environment
npm run check-env

# Test database
npm run test-mongo

# Test API (với curl hoặc Postman)
curl http://localhost:3001/health
curl http://localhost:3001/api/product
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check connection string
npm run test-mongo

# Verify MongoDB Atlas Network Access
# Add IP: 0.0.0.0/0
```

### Environment Variables Missing

```bash
npm run check-env
```

### CORS Error

Check `src/index.js` CORS configuration và frontend URL

## 📚 Documentation

- [Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)
- [Quick Start](./DEPLOY_QUICK_START.md)
- [Checklist](./PRE_DEPLOYMENT_CHECKLIST.md)
- [Quiz Recommendations](./QUIZ_RECOMMENDATION_README.md)
- [Search History](./SEARCH_HISTORY_SETUP.md)
- [Auth Integration](./AUTH_INTEGRATION_UPDATE.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

ISC

## 👥 Authors

- **HoaiNhu** - [GitHub](https://github.com/HoaiNhu)

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Made with ❤️ and ☕**
