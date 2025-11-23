const Voucher = require("../models/VoucherModel");
const UserVoucher = require("../models/UserVoucherModel");
const VoucherUsageHistory = require("../models/VoucherUsageHistoryModel");
const User = require("../models/UserModel");
const nodemailer = require("nodemailer");

// ========== ADMIN FUNCTIONS ==========

// Tạo voucher mới
const createVoucher = async (data) => {
  try {
    const {
      voucherCode,
      voucherName,
      voucherDescription,
      voucherImage,
      voucherType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableProducts,
      applicableCategories,
      startDate,
      endDate,
      totalQuantity,
      usageLimitPerUser,
      isPublic,
      isActive,
      createdBy,
      tags,
      priority,
    } = data;

    // Check if voucher code already exists
    const existingVoucher = await Voucher.findOne({ voucherCode });
    if (existingVoucher) {
      return {
        status: "ERR",
        message: "Mã voucher đã tồn tại!",
      };
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return {
        status: "ERR",
        message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!",
      };
    }

    // Create voucher
    const newVoucher = await Voucher.create({
      voucherCode,
      voucherName,
      voucherDescription,
      voucherImage,
      voucherType,
      discountValue,
      maxDiscountAmount,
      minOrderValue: minOrderValue || 0,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      startDate,
      endDate,
      totalQuantity,
      usageLimitPerUser: usageLimitPerUser || 1,
      isPublic: isPublic !== undefined ? isPublic : true,
      isActive: isActive !== undefined ? isActive : true,
      createdBy,
      tags: tags || [],
      priority: priority || 0,
    });

    return {
      status: "OK",
      message: "Tạo voucher thành công!",
      data: newVoucher,
    };
  } catch (error) {
    throw error;
  }
};

// Tạo voucher hàng loạt
const createBulkVouchers = async (data) => {
  try {
    const {
      baseCode,
      quantity,
      voucherName,
      voucherDescription,
      voucherImage,
      voucherType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableProducts,
      applicableCategories,
      startDate,
      endDate,
      totalQuantityPerVoucher,
      usageLimitPerUser,
      isPublic,
      isActive,
      createdBy,
      tags,
      priority,
    } = data;

    const vouchers = [];
    const existingCodes = [];

    for (let i = 0; i < quantity; i++) {
      const voucherCode = `${baseCode}${String(i + 1).padStart(4, "0")}`;

      // Check if code exists
      const exists = await Voucher.findOne({ voucherCode });
      if (exists) {
        existingCodes.push(voucherCode);
        continue;
      }

      const voucher = {
        voucherCode,
        voucherName: `${voucherName} #${i + 1}`,
        voucherDescription,
        voucherImage,
        voucherType,
        discountValue,
        maxDiscountAmount,
        minOrderValue: minOrderValue || 0,
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
        startDate,
        endDate,
        totalQuantity: totalQuantityPerVoucher || 1,
        usageLimitPerUser: usageLimitPerUser || 1,
        isPublic: isPublic !== undefined ? isPublic : true,
        isActive: isActive !== undefined ? isActive : true,
        createdBy,
        tags: tags || [],
        priority: priority || 0,
      };

      vouchers.push(voucher);
    }

    const createdVouchers = await Voucher.insertMany(vouchers);

    return {
      status: "OK",
      message: `Tạo thành công ${createdVouchers.length}/${quantity} voucher!`,
      data: {
        created: createdVouchers,
        skipped: existingCodes,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Cập nhật voucher
const updateVoucher = async (id, data) => {
  try {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    // Validate dates if provided
    const startDate = data.startDate || voucher.startDate;
    const endDate = data.endDate || voucher.endDate;

    if (new Date(startDate) >= new Date(endDate)) {
      return {
        status: "ERR",
        message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!",
      };
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, data, {
      new: true,
    });

    return {
      status: "OK",
      message: "Cập nhật voucher thành công!",
      data: updatedVoucher,
    };
  } catch (error) {
    throw error;
  }
};

// Xóa voucher
const deleteVoucher = async (id) => {
  try {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    // Check if voucher has been used
    const usageCount = await UserVoucher.countDocuments({
      voucherId: id,
      status: "USED",
    });

    if (usageCount > 0) {
      return {
        status: "ERR",
        message: "Không thể xóa voucher đã được sử dụng!",
      };
    }

    await Voucher.findByIdAndDelete(id);

    // Also delete user vouchers
    await UserVoucher.deleteMany({ voucherId: id });

    return {
      status: "OK",
      message: "Xóa voucher thành công!",
    };
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết voucher
const getVoucherDetails = async (id) => {
  try {
    const voucher = await Voucher.findById(id)
      .populate("applicableProducts")
      .populate("applicableCategories")
      .populate("createdBy", "userName email");

    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    // Get statistics
    const claimedCount = await UserVoucher.countDocuments({
      voucherId: id,
    });
    const usedCount = await UserVoucher.countDocuments({
      voucherId: id,
      status: "USED",
    });

    return {
      status: "OK",
      data: {
        ...voucher.toObject(),
        statistics: {
          claimedCount,
          usedCount,
          remainingCount: voucher.totalQuantity - claimedCount,
        },
      },
    };
  } catch (error) {
    throw error;
  }
};

// Lấy tất cả voucher (có phân trang, lọc, sắp xếp)
const getAllVouchers = async (limit, page, sort, filter) => {
  try {
    const query = {};

    // Filter
    if (filter) {
      const [field, value] = filter;
      query[field] = { $regex: value, $options: "i" };
    }

    // Sort
    const sortOptions = {};
    if (sort) {
      const [order, field] = sort;
      sortOptions[field] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }

    const total = await Voucher.countDocuments(query);
    const vouchers = await Voucher.find(query)
      .populate("applicableProducts", "productName productImage")
      .populate("applicableCategories", "categoryName")
      .populate("createdBy", "userName email")
      .limit(limit)
      .skip(page * limit)
      .sort(sortOptions);

    return {
      status: "OK",
      message: "Lấy danh sách voucher thành công!",
      data: vouchers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Toggle trạng thái voucher
const toggleVoucherStatus = async (id) => {
  try {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();

    return {
      status: "OK",
      message: `Voucher đã được ${
        voucher.isActive ? "kích hoạt" : "vô hiệu hóa"
      }!`,
      data: voucher,
    };
  } catch (error) {
    throw error;
  }
};

// ========== USER FUNCTIONS ==========

// Lấy danh sách voucher công khai (cho user claim)
const getPublicVouchers = async (userId) => {
  try {
    const now = new Date();

    // Get all public and active vouchers
    const vouchers = await Voucher.find({
      isPublic: true,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("applicableProducts", "productName productImage")
      .populate("applicableCategories", "categoryName")
      .sort({ priority: -1, createdAt: -1 });

    // Check which vouchers user has claimed
    const userVouchers = await UserVoucher.find({
      userId,
      voucherId: { $in: vouchers.map((v) => v._id) },
    }).select("voucherId status");

    const userVoucherMap = {};
    userVouchers.forEach((uv) => {
      userVoucherMap[uv.voucherId.toString()] = uv.status;
    });

    const vouchersWithStatus = vouchers.map((voucher) => {
      const voucherObj = voucher.toObject();
      return {
        ...voucherObj,
        userStatus: userVoucherMap[voucher._id.toString()] || null,
        canClaim:
          !userVoucherMap[voucher._id.toString()] &&
          voucher.claimedQuantity < voucher.totalQuantity,
      };
    });

    return {
      status: "OK",
      data: vouchersWithStatus,
    };
  } catch (error) {
    throw error;
  }
};

// User claim voucher
const claimVoucher = async (userId, voucherId) => {
  try {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    // Check if voucher is available
    if (!voucher.isAvailable) {
      return {
        status: "ERR",
        message: "Voucher không còn khả dụng!",
      };
    }

    // Check if voucher is full
    if (voucher.claimedQuantity >= voucher.totalQuantity) {
      return {
        status: "ERR",
        message: "Voucher đã hết!",
      };
    }

    // Check if user already claimed this voucher
    const existingClaim = await UserVoucher.findOne({ userId, voucherId });
    if (existingClaim) {
      return {
        status: "ERR",
        message: "Bạn đã lưu voucher này rồi!",
      };
    }

    // Create user voucher
    const userVoucher = await UserVoucher.create({
      userId,
      voucherId,
      expiresAt: voucher.endDate,
      status: "ACTIVE",
    });

    // Increment claimed quantity
    await voucher.incrementClaimed();

    return {
      status: "OK",
      message: "Lưu voucher thành công!",
      data: userVoucher,
    };
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách voucher của user
const getUserVouchers = async (userId, status) => {
  try {
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const userVouchers = await UserVoucher.find(query)
      .populate({
        path: "voucherId",
        populate: [
          { path: "applicableProducts", select: "productName productImage" },
          { path: "applicableCategories", select: "categoryName" },
        ],
      })
      .sort({ claimedAt: -1 });

    // Auto-update expired vouchers
    const now = new Date();
    for (const uv of userVouchers) {
      if (uv.status === "ACTIVE" && uv.expiresAt < now) {
        await uv.markAsExpired();
      }
    }

    return {
      status: "OK",
      data: userVouchers,
    };
  } catch (error) {
    throw error;
  }
};

// Validate voucher code (khi user nhập mã)
const validateVoucherCode = async (userId, voucherCode) => {
  try {
    const voucher = await Voucher.findOne({
      voucherCode: voucherCode.toUpperCase(),
    });

    if (!voucher) {
      return {
        status: "ERR",
        message: "Mã voucher không tồn tại!",
      };
    }

    if (!voucher.isAvailable) {
      return {
        status: "ERR",
        message: "Voucher không còn khả dụng!",
      };
    }

    // Check if user already has this voucher
    const userVoucher = await UserVoucher.findOne({
      userId,
      voucherId: voucher._id,
    });

    if (!userVoucher) {
      // Auto claim for user
      const claimResult = await claimVoucher(userId, voucher._id);
      if (claimResult.status === "ERR") {
        return claimResult;
      }
    }

    return {
      status: "OK",
      message: "Mã voucher hợp lệ!",
      data: voucher,
    };
  } catch (error) {
    throw error;
  }
};

// Áp dụng vouchers vào order
const applyVouchersToOrder = async (userId, voucherIds, orderData) => {
  try {
    const { orderItems, totalItemPrice } = orderData;

    // Get user's vouchers
    const userVouchers = await UserVoucher.find({
      userId,
      _id: { $in: voucherIds },
      status: "ACTIVE",
    }).populate("voucherId");

    if (userVouchers.length === 0) {
      return {
        status: "ERR",
        message: "Không tìm thấy voucher hợp lệ!",
      };
    }

    // Check for duplicate voucher types (chỉ áp dụng 1 voucher mỗi loại)
    const voucherTypes = {};
    for (const uv of userVouchers) {
      const type = uv.voucherId.voucherType;
      if (voucherTypes[type]) {
        return {
          status: "ERR",
          message: `Chỉ được áp dụng 1 voucher loại ${type}!`,
        };
      }
      voucherTypes[type] = true;
    }

    let totalDiscount = 0;
    const appliedVouchers = [];

    // Sort by priority (cao -> thấp)
    userVouchers.sort((a, b) => b.voucherId.priority - a.voucherId.priority);

    for (const userVoucher of userVouchers) {
      const voucher = userVoucher.voucherId;

      // Check expiry
      if (new Date() > voucher.endDate) {
        await userVoucher.markAsExpired();
        continue;
      }

      // Check minimum order value
      if (totalItemPrice < voucher.minOrderValue) {
        continue;
      }

      // Check applicable products/categories
      if (
        voucher.applicableProducts.length > 0 ||
        voucher.applicableCategories.length > 0
      ) {
        const isApplicable = orderItems.some((item) => {
          const productId = item.product.toString();
          const categoryId = item.category?.toString();

          return (
            voucher.applicableProducts.some(
              (p) => p.toString() === productId
            ) ||
            voucher.applicableCategories.some(
              (c) => c.toString() === categoryId
            )
          );
        });

        if (!isApplicable) {
          continue;
        }
      }

      // Calculate discount
      let discount = 0;
      if (voucher.voucherType === "PERCENTAGE") {
        discount = (totalItemPrice * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount) {
          discount = Math.min(discount, voucher.maxDiscountAmount);
        }
      } else if (voucher.voucherType === "FIXED_AMOUNT") {
        discount = voucher.discountValue;
      } else if (voucher.voucherType === "FREE_SHIPPING") {
        discount = orderData.shippingPrice || 0;
      }

      totalDiscount += discount;
      appliedVouchers.push({
        userVoucherId: userVoucher._id,
        voucherId: voucher._id,
        voucherCode: voucher.voucherCode,
        voucherType: voucher.voucherType,
        discountAmount: discount,
      });
    }

    return {
      status: "OK",
      data: {
        totalDiscount,
        appliedVouchers,
        finalPrice: Math.max(0, totalItemPrice - totalDiscount),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Mark vouchers as used after order
const markVouchersAsUsed = async (appliedVouchers, orderId) => {
  try {
    for (const av of appliedVouchers) {
      const userVoucher = await UserVoucher.findById(av.userVoucherId);
      if (userVoucher) {
        await userVoucher.markAsUsed(orderId);

        // Increment voucher used quantity
        const voucher = await Voucher.findById(av.voucherId);
        if (voucher) {
          await voucher.incrementUsed();
        }

        // Create usage history
        await VoucherUsageHistory.create({
          userId: userVoucher.userId,
          voucherId: av.voucherId,
          userVoucherId: av.userVoucherId,
          orderId,
          originalOrderValue: av.originalOrderValue,
          discountAmount: av.discountAmount,
          finalOrderValue: av.finalOrderValue,
          voucherCode: av.voucherCode,
          voucherType: av.voucherType,
        });
      }
    }

    return {
      status: "OK",
      message: "Đã cập nhật trạng thái voucher!",
    };
  } catch (error) {
    throw error;
  }
};

// ========== EMAIL FUNCTIONS ==========

// Gửi voucher qua email
const sendVoucherEmail = async (voucherId, emails) => {
  try {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return {
        status: "ERR",
        message: "Voucher không tồn tại!",
      };
    }

    // Configure email transporter (sử dụng Brevo SMTP có sẵn)
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailPromises = emails.map(async (email) => {
      const user = await User.findOne({ email });

      const mailOptions = {
        from: `"Avocado Shop" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: `🎉 Bạn nhận được voucher ${voucher.voucherName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Chúc mừng! Bạn nhận được voucher đặc biệt</h2>
            
            ${
              voucher.voucherImage
                ? `<img src="${voucher.voucherImage}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />`
                : ""
            }
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">${voucher.voucherName}</h3>
              <p style="margin: 5px 0; font-size: 14px;">${
                voucher.voucherDescription
              }</p>
              <div style="background: white; color: #333; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">Mã voucher</p>
                <h2 style="margin: 5px 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">${
                  voucher.voucherCode
                }</h2>
              </div>
            </div>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0;">📋 Chi tiết voucher:</h4>
              <ul style="line-height: 1.8;">
                <li><strong>Loại giảm giá:</strong> ${getVoucherTypeText(
                  voucher.voucherType
                )}</li>
                <li><strong>Giá trị:</strong> ${formatDiscountValue(
                  voucher
                )}</li>
                <li><strong>Đơn tối thiểu:</strong> ${voucher.minOrderValue.toLocaleString(
                  "vi-VN"
                )}₫</li>
                <li><strong>Hiệu lực:</strong> ${new Date(
                  voucher.startDate
                ).toLocaleDateString("vi-VN")} - ${new Date(
          voucher.endDate
        ).toLocaleDateString("vi-VN")}</li>
                <li><strong>Số lần sử dụng:</strong> ${
                  voucher.usageLimitPerUser
                } lần</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Mua sắm ngay
              </a>
            </div>

            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              Cảm ơn bạn đã tin tưởng Avocado Cake! ❤️
            </p>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    return {
      status: "OK",
      message: `Đã gửi voucher đến ${emails.length} email!`,
    };
  } catch (error) {
    throw error;
  }
};

// Helper functions for email template
const getVoucherTypeText = (type) => {
  const types = {
    PERCENTAGE: "Giảm theo phần trăm",
    FIXED_AMOUNT: "Giảm số tiền cố định",
    FREE_SHIPPING: "Miễn phí vận chuyển",
    COMBO: "Combo đặc biệt",
  };
  return types[type] || type;
};

const formatDiscountValue = (voucher) => {
  if (voucher.voucherType === "PERCENTAGE") {
    let text = `${voucher.discountValue}%`;
    if (voucher.maxDiscountAmount) {
      text += ` (tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}₫)`;
    }
    return text;
  } else if (voucher.voucherType === "FIXED_AMOUNT") {
    return `${voucher.discountValue.toLocaleString("vi-VN")}₫`;
  } else if (voucher.voucherType === "FREE_SHIPPING") {
    return "Miễn phí ship";
  }
  return voucher.discountValue;
};

// ========== STATISTICS ==========

// Lấy thống kê voucher
const getVoucherStatistics = async () => {
  try {
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ isActive: true });
    const totalClaimed = await UserVoucher.countDocuments();
    const totalUsed = await UserVoucher.countDocuments({ status: "USED" });

    // Top vouchers
    const topVouchers = await Voucher.find()
      .sort({ usedQuantity: -1 })
      .limit(10)
      .select("voucherCode voucherName usedQuantity claimedQuantity");

    return {
      status: "OK",
      data: {
        totalVouchers,
        activeVouchers,
        totalClaimed,
        totalUsed,
        usageRate:
          totalClaimed > 0 ? ((totalUsed / totalClaimed) * 100).toFixed(2) : 0,
        topVouchers,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  // Admin
  createVoucher,
  createBulkVouchers,
  updateVoucher,
  deleteVoucher,
  getVoucherDetails,
  getAllVouchers,
  toggleVoucherStatus,

  // User
  getPublicVouchers,
  claimVoucher,
  getUserVouchers,
  validateVoucherCode,
  applyVouchersToOrder,
  markVouchersAsUsed,

  // Email
  sendVoucherEmail,

  // Statistics
  getVoucherStatistics,
};
