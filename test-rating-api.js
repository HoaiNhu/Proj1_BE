const axios = require("axios");
require("dotenv").config();

async function testRatingAPI() {
  try {
    // ProductId từ ví dụ của bạn
    const productId = "67643ff21e0d9cd93752293d";
    const backendUrl = process.env.API_URL || "http://localhost:3001/api";

    const url = `${backendUrl}/rating/product/${productId}`;
    console.log("🔍 Testing URL:", url);
    console.log("🔍 Product ID:", productId);
    console.log("");

    const response = await axios.get(url);

    console.log("✅ API Response:");
    console.log("   Status:", response.data.status);
    console.log("   Message:", response.data.message);
    console.log("   Number of ratings:", response.data.data?.length || 0);
    console.log("");

    if (response.data.data?.length > 0) {
      console.log("📝 Ratings found:");
      response.data.data.forEach((rating, index) => {
        console.log(
          `\n   ${index + 1}. ${rating.userName} - ${rating.rating}⭐`
        );
        console.log(`      Comment: ${rating.comment || "(no comment)"}`);
        console.log(`      Visible: ${rating.isVisible}`);
        console.log(
          `      Created: ${new Date(rating.createdAt).toLocaleString("vi-VN")}`
        );
      });
    } else {
      console.log("⚠️ No ratings found for this product!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
  }
}

testRatingAPI();
