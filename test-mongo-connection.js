// Script để test MongoDB connection
// Chạy: node test-mongo-connection.js

require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔄 Testing MongoDB connection...");
    console.log(
      "Connection string:",
      process.env.MONGO_DB?.substring(0, 30) + "..."
    );

    await mongoose.connect(process.env.MONGO_DB);

    console.log("✅ MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.db.databaseName);

    // Test query
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("📚 Collections found:", collections.length);
    collections.forEach((col) => {
      console.log("  -", col.name);
    });

    await mongoose.connection.close();
    console.log("✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

testConnection();
