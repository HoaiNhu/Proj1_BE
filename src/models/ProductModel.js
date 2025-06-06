const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    //productCode: { type: String, required: true },
    productName: { type: String, required: true, unique: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String, require: true },
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productSize: { type: Number, default: 0 },
    productQuantity: { type: Number, default: 0 }, //số lượng sp
    // productExpiry: { type: Date, required: true }, //hạn sd
    averageRating: { type: Number, default: 5.0 }, // Mặc định 5 sao
    totalRatings: { type: Number, default: 1 }, // Mặc định 1 đánh giá (đánh giá mặc định)
    productDescription: { type: String, required: true },
    productDiscount: { type: Number, default: 0 }, 
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
