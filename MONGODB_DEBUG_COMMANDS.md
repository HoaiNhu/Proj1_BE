# MongoDB Debug Commands

## 1. Connect to your database

```bash
mongosh
use your-database-name
```

## 2. Check all collections

```javascript
show collections
```

## 3. Possible collection names cho SearchHistory:

- `searchhistories` (default MongoDB naming)
- `searchHistory` (nếu có explicit collection name)
- `SearchHistories`

## 4. Query từng collection name:

```javascript
// Check searchhistories
db.searchhistories.find();
db.searchhistories.count();

// Check searchHistory
db.searchHistory.find();
db.searchHistory.count();

// Check SearchHistories
db.SearchHistories.find();
db.SearchHistories.count();
```

## 5. Nếu collection tồn tại nhưng empty:

```javascript
// Insert test data
db.searchHistory.insertOne({
  userId: ObjectId(),
  query: "test query",
  timestamp: new Date(),
});

// Verify insert
db.searchHistory.find().pretty();
```

## 6. Check database connection:

```javascript
// Show current database
db.getName()

// Show all databases
show dbs

// Switch database if needed
use correct-database-name
```

## 7. MongoDB Compass

Nếu bạn dùng MongoDB Compass GUI:

1. Connect to database
2. Browse collections
3. Look for collections có tên gần giống "search" hoặc "history"

## 8. Debug connection string

Kiểm tra connection string trong:

- `.env` file
- Database config file
- Đảm bảo database name đúng
