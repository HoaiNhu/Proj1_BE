require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/CategoryModel");

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

// Danh sách category mới
const newCategories = [
  {
    categoryCode: "BT1",
    categoryName: "Bánh tươi",
    isActive: true,
  },
  {
    categoryCode: "BBG1",
    categoryName: "Bánh bông lan giá rẻ",
    isActive: true,
  },
  {
    categoryCode: "BCR1",
    categoryName: "Bánh croissant",
    isActive: true,
  },
  {
    categoryCode: "BCC1",
    categoryName: "Bánh cupcake",
    isActive: true,
  },
  {
    categoryCode: "BTR1",
    categoryName: "Bánh tart",
    isActive: true,
  },
  {
    categoryCode: "BCS1",
    categoryName: "Bánh cheesecake",
    isActive: true,
  },
  {
    categoryCode: "BCH1",
    categoryName: "Bánh chocolate",
    isActive: true,
  },
  {
    categoryCode: "BSN1",
    categoryName: "Bánh sinh nhật",
    isActive: true,
  },
  {
    categoryCode: "BTC1",
    categoryName: "Bánh truyền thống",
    isActive: true,
  },
  {
    categoryCode: "BPH1",
    categoryName: "Bánh Pháp",
    isActive: true,
  },
  {
    categoryCode: "BDN1",
    categoryName: "Bánh donut",
    isActive: true,
  },
  {
    categoryCode: "BMF1",
    categoryName: "Bánh muffin",
    isActive: true,
  },
  {
    categoryCode: "BBR1",
    categoryName: "Bánh brownie",
    isActive: true,
  },
  {
    categoryCode: "BMC1",
    categoryName: "Bánh macaron",
    isActive: true,
  },
  {
    categoryCode: "BEC1",
    categoryName: "Bánh eclair",
    isActive: true,
  },
];

// Hàm thêm category
const addCategories = async () => {
  try {
    await connectDB();

    console.log(`\n🚀 Bắt đầu thêm ${newCategories.length} category mới...`);

    // Thêm category vào database
    const result = await Category.insertMany(newCategories);

    console.log(
      `\n✅ THÀNH CÔNG! Đã thêm ${result.length} category vào database!`
    );
    console.log("\n📋 Danh sách category đã thêm:");
    console.log("═".repeat(60));

    result.forEach((category, index) => {
      console.log(
        `${index + 1}. [${category.categoryCode}] ${category.categoryName}`
      );
      console.log(
        `   📌 Trạng thái: ${
          category.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"
        }`
      );
    });

    console.log("═".repeat(60));
    console.log(`\n💡 Tổng số category: ${result.length}`);
    console.log(
      `📊 Category đang hoạt động: ${result.filter((c) => c.isActive).length}`
    );
  } catch (error) {
    if (error.code === 11000) {
      console.error("\n❌ LỖI: Có category bị trùng mã!");
      console.error("💡 Mỗi categoryCode phải là duy nhất.");
      console.error("🔍 Vui lòng kiểm tra lại mã category trong database.");
    } else {
      console.error("\n❌ Lỗi khi thêm category:");
      console.error(error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Đã đóng kết nối MongoDB");
    console.log("👋 Hoàn tất!\n");
  }
};

// Chạy script
console.log("📂 SCRIPT THÊM CATEGORY MỚI");
console.log("═".repeat(60));
addCategories();
