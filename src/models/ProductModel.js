const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, unique: true },
    productImage: { type: String, required: true }, //Link ảnh
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productPrice: { type: Number, required: true },
    productQuantity: { type: Number, required: true }, //số lượng sp
    productRating: { type: Number, required: false },
    productDescription: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
