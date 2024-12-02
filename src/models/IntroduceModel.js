const mongoose = require("mongoose");

const introduceSchema = new mongoose.Schema(
  {
    introduceCode: {
      type: String,
      required: true,
      unique: true, // Mã giới thiệu duy nhất
    },
    introduceName: {
      type: String,
      required: true, // Tên giới thiệu
    },
    introduceTitle: {
      type: String,
      required: true, // Tiêu đề của giới thiệu
    },
    introduceContent: {
      type: String,
      required: true, // Nội dung chi tiết
    },
    introduceImage: {
      type: String,
      required: false, // Hình ảnh đại diện, không bắt buộc
    },
    author: {
      type: String,
      required: false, // Tên tác giả, nếu có
    },
    tags: [
      {
        type: String, // Các từ khóa hoặc thể loại liên quan đến giới thiệu
        required: false,
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Trạng thái hiển thị (mặc định là active)
    },
    introduceDate: {
      type: Date, // Ngày giới thiệu được tạo hoặc cập nhật
      required: false,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Introduce = mongoose.model("Introduce", introduceSchema);
module.exports = Introduce;
