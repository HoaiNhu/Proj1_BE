const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    familyName: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: Number, required: true },
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userConfirmPassword: { type: String, required: true },
    userAddress: {
      ward: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ward", // Liên kết đến model Ward
        required: true,
      },
      district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "District", // Liên kết đến model District
        required: true,
      },
      city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City", // Liên kết đến model City
        required: true,
      },
    },
    userImage: { type: String, required: false },
    // isAdmin: { type: Boolean, default: false, required: true },
    userRole: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
      required: true,
    },    
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
