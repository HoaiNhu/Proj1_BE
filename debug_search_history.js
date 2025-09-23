// Script để debug search history
const mongoose = require("mongoose");
const SearchHistory = require("./src/models/SearchHistoryModel");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_DB || "mongodb://localhost:27017/your-db-name"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const debugSearchHistory = async () => {
  await connectDB();

  try {
    console.log("\n🔍 Debug Search History:");

    // 1. Kiểm tra collection name
    console.log("Collection name:", SearchHistory.collection.name);

    // 2. Liệt kê tất cả collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("\n📋 All collections:");
    collections.forEach((col) => console.log("  -", col.name));

    // 3. Đếm documents trong SearchHistory
    const count = await SearchHistory.countDocuments();
    console.log(`\n📊 SearchHistory documents count: ${count}`);

    // 4. Lấy tất cả documents
    const allRecords = await SearchHistory.find().limit(10);
    console.log("\n📄 Recent search history records:");
    allRecords.forEach((record, index) => {
      console.log(
        `  ${index + 1}. Query: "${record.query}", UserId: ${
          record.userId
        }, Time: ${record.timestamp}`
      );
    });

    // 5. Test tạo một record mới
    console.log("\n🧪 Creating test record...");
    const testRecord = new SearchHistory({
      userId: new mongoose.Types.ObjectId(), // Mock userId
      query: "test search query " + Date.now(),
    });

    const saved = await testRecord.save();
    console.log("✅ Test record saved:", saved._id);

    // 6. Verify record đã được lưu
    const newCount = await SearchHistory.countDocuments();
    console.log(`📊 New count: ${newCount}`);
  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
};

debugSearchHistory();
