# Hệ thống Gợi ý Sản phẩm dựa trên Quiz (Tích hợp Python ML)

## Tổng quan

Hệ thống này cung cấp khả năng gợi ý sản phẩm cho khách hàng dựa trên câu trả lời quiz, **tích hợp cả logic-based và machine learning model Python (LightFM)**. Khi người dùng hoàn thành quiz, hệ thống sẽ:

1. **Ưu tiên sử dụng Python ML model** (LightFM) nếu available
2. **Fallback về logic-based** nếu Python API không available
3. **Kết hợp cả hai** để tối ưu kết quả gợi ý

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js API    │    │  Python ML API  │
│   (React)       │◄──►│   (Express)      │◄──►│   (FastAPI)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   MongoDB        │    │   Redis Cache   │
                       │   (Products,     │    │   (Upstash)     │
                       │    Users, Quiz)  │    │                 │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Cài đặt và Chạy

### 1. Backend Node.js

```bash
cd src
npm install
npm start
```

### 2. Python Recommendation Server

```bash
# Cách 1: Sử dụng script tự động
python start_python_recommendation.py

# Cách 2: Thủ công
cd RCM_System
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
cd Proj1_FE
npm install
npm start
```

## 🔧 Cấu hình

### Environment Variables

**Node.js (.env):**

```env
PYTHON_RECOMMENDATION_API_URL=http://localhost:8000
```

**Python (.env trong RCM_System):**

```env
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
UPSTASH_REDIS_HOST=your_upstash_host
UPSTASH_REDIS_PORT=your_upstash_port
UPSTASH_REDIS_PASSWORD=your_upstash_password
```

## 📊 Logic Gợi ý Tích hợp

### 1. **Python ML Model (LightFM)**

- Sử dụng collaborative filtering
- Phân tích user-item interactions
- Tính toán similarity scores
- Cache kết quả trong Redis

### 2. **Quiz-based Logic**

- Mapping câu trả lời → tiêu chí sản phẩm
- Tính điểm dựa trên từ khóa, giá cả, rating
- Kết hợp với kết quả từ ML model

### 3. **Fallback Strategy**

```
Python API Available? ──Yes──► Use ML Model ──► Apply Quiz Logic ──► Final Results
         │ No
         ▼
   Logic-based Only ──► Apply Quiz Logic ──► Final Results
```

## 🔌 API Endpoints

### Node.js API (Port 3000)

- `POST /api/quiz/responses` - Lưu câu trả lời và nhận gợi ý
- `GET /api/quiz-recommendation/session/:sessionId` - Lấy gợi ý theo session
- `POST /api/quiz-recommendation/answers` - Lấy gợi ý theo câu trả lời
- `GET /api/quiz-recommendation/history` - Lấy lịch sử gợi ý
- `GET /api/quiz-recommendation/mood/:mood` - Lấy gợi ý theo mood
- `GET /api/quiz-recommendation/model-info` - Thông tin model Python

### Python API (Port 8000)

- `POST /recommend` - Gợi ý sản phẩm (LightFM)
- `POST /recommend/popular` - Sản phẩm phổ biến
- `GET /evaluate-model` - Đánh giá model
- `POST /interaction/log` - Log tương tác
- `GET /health` - Kiểm tra health

## 🎯 Ví dụ Sử dụng

### 1. Hoàn thành Quiz và nhận gợi ý

```javascript
// Frontend
const responses = [
  { questionId: "quiz1", answer: "happy", customAnswer: null },
  { questionId: "quiz2", answer: "chocolate", customAnswer: null },
];

const result = await QuizService.saveMultipleResponses(responses);
console.log("Gợi ý:", result.recommendations);
console.log("Nguồn:", result.source); // "python_model" hoặc "logic_based"
```

### 2. Kiểm tra thông tin model

```javascript
const modelInfo = await QuizRecommendationService.getModelInfo();
console.log("Python API available:", modelInfo.pythonApiAvailable);
console.log("Model evaluation:", modelInfo.modelEvaluation);
```

## 📈 Đánh giá Hiệu suất

### Python ML Model

- **Precision**: Độ chính xác của gợi ý
- **Recall**: Độ bao phủ của gợi ý
- **F1-Score**: Điểm tổng hợp

### Logic-based Fallback

- **Keyword Matching**: Khớp từ khóa
- **Price Range**: Khoảng giá phù hợp
- **Rating Score**: Điểm đánh giá

## 🔄 Workflow

1. **User hoàn thành quiz**
2. **Backend gọi Python API** (nếu available)
3. **Lấy danh sách sản phẩm từ ML model**
4. **Áp dụng logic quiz để lọc và sắp xếp**
5. **Log interaction để cập nhật model**
6. **Trả về kết quả cuối cùng**

## 🛠️ Troubleshooting

### Python API không khởi động

```bash
# Kiểm tra dependencies
pip list | grep -E "(fastapi|lightfm|pymongo)"

# Kiểm tra MongoDB connection
python -c "from RCM_System.app.utils import connect_to_mongo; print(connect_to_mongo())"
```

### Node.js không kết nối được Python API

```bash
# Kiểm tra Python server
curl http://localhost:8000/health

# Kiểm tra environment variable
echo $PYTHON_RECOMMENDATION_API_URL
```

## 📝 Lưu ý

1. **Python server phải chạy trước** Node.js để có ML recommendations
2. **MongoDB và Redis** phải được cấu hình đúng
3. **Fallback logic** đảm bảo hệ thống luôn hoạt động
4. **Cache Redis** giúp tăng tốc độ response
5. **Model được cập nhật** tự động khi có dữ liệu mới

## 🚀 Mở rộng

- Thêm các thuật toán ML khác (Neural Collaborative Filtering, BERT)
- Tích hợp real-time learning
- Thêm A/B testing cho các thuật toán
- Tối ưu hyperparameters của LightFM
- Thêm explainable AI cho gợi ý
