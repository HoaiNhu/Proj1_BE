const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    discountCode: {
      type: String,
      required: true,
      unique: true, // Mã khuyến mãi phải duy nhất
    },
    discountName: {
      type: String,
      required: true, // Tên khuyến mãi (hiển thị cho người dùng)
    },
    discountValue: {
      type: Number,
      required: true, // Giá trị chiết khấu (số tiền hoặc phần trăm)
    },

    discountImage: {
      type: String,
      require: true
    },
    discountStartDate: {
      type: Date,
      required: true,
    },
    discountEndDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Trạng thái khuyến mãi (true: còn hiệu lực, false: vô hiệu)
    },
    discountProduct:[{
      type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
    }]
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Kiểm tra logic ngày bắt đầu và kết thúc
discountSchema.pre("save", function (next) {
  if (this.discountStartDate >= this.discountEndDate) {
    return next(new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!"));
  }
  next();
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
