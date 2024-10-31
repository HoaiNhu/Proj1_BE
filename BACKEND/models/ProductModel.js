const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, require: true, unique: true },
    image: { type: String, require: true }, //Link ảnh
    type: { type: String, require: true }, //Catalog
    price: { type: Number, require: true },
    countInStock: { type: Number, require: true }, //số lượng sp
    rating: { type: Number, require: true },
    description: { type: String},
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
