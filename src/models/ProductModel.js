const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    //productCode: { type: String, required: true },
    productName: { type: String, required: true, unique: true },
    productPrice: { type: Number, required: true },
    productImage: {type: String, require: true },
    productCategory:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "productImage",
      required: true,},
      productSize: {type: Number, default:0 },
   productQuantity: { type: Number, default:0}, //số lượng sp
    // productExpiry: { type: Date, required: true }, //hạn sd
    // productRating: { type: Number, required: false },
    productDescription: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
