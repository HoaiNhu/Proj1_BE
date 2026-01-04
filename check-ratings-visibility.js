const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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

async function checkRatings() {
  try {
    // Lấy tất cả ratings
    const allRatings = await Rating.find({});
    console.log(`\n📊 Total ratings in database: ${allRatings.length}`);

    // Lấy ratings visible
    const visibleRatings = await Rating.find({ isVisible: true });
    console.log(`✅ Visible ratings: ${visibleRatings.length}`);

    // Lấy ratings hidden
    const hiddenRatings = await Rating.find({ isVisible: false });
    console.log(`❌ Hidden ratings: ${hiddenRatings.length}`);

    // Group by product
    const ratingsByProduct = {};
    allRatings.forEach((rating) => {
      const productId = rating.productId.toString();
      if (!ratingsByProduct[productId]) {
        ratingsByProduct[productId] = {
          total: 0,
          visible: 0,
          hidden: 0,
          ratings: [],
        };
      }
      ratingsByProduct[productId].total++;
      if (rating.isVisible) {
        ratingsByProduct[productId].visible++;
      } else {
        ratingsByProduct[productId].hidden++;
      }
      ratingsByProduct[productId].ratings.push({
        userName: rating.userName,
        rating: rating.rating,
        comment: rating.comment,
        isVisible: rating.isVisible,
        createdAt: rating.createdAt,
      });
    });

    console.log("\n📦 Ratings by Product:");
    Object.entries(ratingsByProduct).forEach(([productId, data]) => {
      console.log(`\nProduct ID: ${productId}`);
      console.log(
        `  Total: ${data.total} | Visible: ${data.visible} | Hidden: ${data.hidden}`
      );
      data.ratings.forEach((r, i) => {
        console.log(
          `    ${i + 1}. ${r.userName} - ${r.rating}⭐ - Visible: ${
            r.isVisible
          }`
        );
        if (r.comment) console.log(`       Comment: ${r.comment}`);
      });
    });

    // Kiểm tra xem có ratings nào thiếu isVisible field không
    const ratingsWithoutVisibleField = allRatings.filter(
      (r) => r.isVisible === undefined
    );
    if (ratingsWithoutVisibleField.length > 0) {
      console.log(
        `\n⚠️ Found ${ratingsWithoutVisibleField.length} ratings without isVisible field!`
      );
      console.log("These ratings might not show up in the frontend.");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
  }
}

checkRatings();
