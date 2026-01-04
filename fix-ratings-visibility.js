const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define Rating schema
const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: Number,
    comment: String,
    userName: String,
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

async function fixRatingsVisibility() {
  try {
    // Tìm tất cả ratings không có field isVisible
    const ratingsWithoutVisible = await Rating.find({
      $or: [{ isVisible: { $exists: false } }, { isVisible: null }],
    });

    console.log(
      `\n🔍 Found ${ratingsWithoutVisible.length} ratings without isVisible field`
    );

    if (ratingsWithoutVisible.length === 0) {
      console.log("✅ All ratings already have isVisible field!");
      mongoose.connection.close();
      return;
    }

    // Log một vài ví dụ
    console.log("\n📝 Sample ratings to be fixed:");
    ratingsWithoutVisible.slice(0, 3).forEach((r, i) => {
      console.log(
        `  ${i + 1}. Product: ${r.productId}, User: ${r.userName}, Rating: ${
          r.rating
        }⭐`
      );
    });

    // Cập nhật tất cả ratings
    console.log("\n🔧 Updating all ratings to set isVisible: true...");
    const result = await Rating.updateMany(
      {
        $or: [{ isVisible: { $exists: false } }, { isVisible: null }],
      },
      {
        $set: { isVisible: true },
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} ratings!`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}`);

    // Verify
    const allRatings = await Rating.find({});
    const visibleRatings = await Rating.find({ isVisible: true });
    const hiddenRatings = await Rating.find({ isVisible: false });

    console.log("\n📊 Final Statistics:");
    console.log(`   Total ratings: ${allRatings.length}`);
    console.log(`   Visible ratings: ${visibleRatings.length}`);
    console.log(`   Hidden ratings: ${hiddenRatings.length}`);

    mongoose.connection.close();
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

fixRatingsVisibility();
