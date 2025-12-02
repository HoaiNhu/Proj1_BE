const Rank = require("../models/RankModel");
const UserRankHistory = require("../models/UserRankHistoryModel");
const User = require("../models/UserModel");
const VoucherService = require("./VoucherService");
const EmailService = require("./EmailService");

/**
 * Tạo rank mới
 */
const createRank = async (rankData) => {
  try {
    const {
      rankName,
      rankDisplayName,
      rankCode,
      discountPercent,
      minSpending,
      maxSpending,
      priority,
      color,
      icon,
      benefits,
      description,
    } = rankData;

    // Kiểm tra rank đã tồn tại chưa
    const existingRank = await Rank.findOne({ rankCode });
    if (existingRank) {
      throw new Error("Rank code already exists");
    }

    // Tạo rank mới
    const newRank = await Rank.create({
      rankName,
      rankDisplayName,
      rankCode,
      discountPercent,
      minSpending,
      maxSpending,
      priority,
      color,
      icon,
      benefits: benefits || [],
      description,
      isActive: true,
    });

    return {
      status: "OK",
      message: "Rank created successfully",
      data: newRank,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả ranks
 */
const getAllRanks = async () => {
  try {
    const ranks = await Rank.find().sort({ priority: 1 });
    return {
      status: "OK",
      message: "Get all ranks successfully",
      data: ranks,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết rank
 */
const getRankById = async (rankId) => {
  try {
    const rank = await Rank.findById(rankId);
    if (!rank) {
      throw new Error("Rank not found");
    }

    return {
      status: "OK",
      message: "Get rank details successfully",
      data: rank,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật rank
 */
const updateRank = async (rankId, updateData) => {
  try {
    const rank = await Rank.findById(rankId);
    if (!rank) {
      throw new Error("Rank not found");
    }

    // Cập nhật rank
    const updatedRank = await Rank.findByIdAndUpdate(rankId, updateData, {
      new: true,
    });

    return {
      status: "OK",
      message: "Rank updated successfully",
      data: updatedRank,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa rank
 */
const deleteRank = async (rankId) => {
  try {
    const rank = await Rank.findById(rankId);
    if (!rank) {
      throw new Error("Rank not found");
    }

    // Kiểm tra xem có user nào đang sử dụng rank này không
    const usersWithRank = await User.countDocuments({ currentRank: rankId });
    if (usersWithRank > 0) {
      throw new Error(
        `Cannot delete rank. ${usersWithRank} users are currently using this rank`
      );
    }

    await Rank.findByIdAndDelete(rankId);

    return {
      status: "OK",
      message: "Rank deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy rank của user dựa vào totalSpending
 */
const getUserRank = async (userId) => {
  try {
    const user = await User.findById(userId).populate("currentRank");
    if (!user) {
      throw new Error("User not found");
    }

    // Tìm rank phù hợp với totalSpending
    const appropriateRank = await Rank.findRankBySpending(user.totalSpending);

    // Nếu rank hiện tại khác với rank phù hợp, cập nhật
    if (
      !user.currentRank ||
      user.currentRank._id.toString() !== appropriateRank._id.toString()
    ) {
      await updateUserRank(userId, appropriateRank._id);
    }

    return {
      status: "OK",
      message: "Get user rank successfully",
      data: {
        currentRank: appropriateRank,
        totalSpending: user.totalSpending,
        discountPercent: appropriateRank.discountPercent,
        nextRank: await getNextRank(appropriateRank.priority),
        progressToNextRank: await calculateProgressToNextRank(
          user.totalSpending,
          appropriateRank
        ),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật rank cho user
 */
const updateUserRank = async (userId, newRankId) => {
  try {
    const user = await User.findById(userId).populate("currentRank");
    if (!user) {
      throw new Error("User not found");
    }

    const oldRank = user.currentRank;
    const newRank = await Rank.findById(newRankId);

    if (!newRank) {
      throw new Error("New rank not found");
    }

    // Cập nhật rank cho user
    user.currentRank = newRankId;
    await user.save();

    // Lưu lịch sử thăng hạng
    const history = await UserRankHistory.create({
      userId: userId,
      oldRank: oldRank ? oldRank._id : null,
      newRank: newRankId,
      totalSpendingAtPromotion: user.totalSpending,
      voucherSent: false,
      emailSent: false,
    });

    // Nếu user thăng hạng (không phải lần đầu), gửi voucher và email
    if (oldRank && oldRank.priority < newRank.priority) {
      await sendRankUpRewards(userId, newRank, history._id);
    }

    return {
      status: "OK",
      message: "User rank updated successfully",
      data: {
        oldRank,
        newRank,
        user,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi phần thưởng khi thăng hạng
 */
const sendRankUpRewards = async (userId, newRank, historyId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Tạo voucher đặc biệt cho user
    const voucherData = {
      voucherCode: `RANK${newRank.rankCode}_${Date.now()}`,
      voucherName: `Chúc mừng thăng hạng ${newRank.rankDisplayName}`,
      voucherDescription: `Voucher đặc biệt dành riêng cho khách hàng ${newRank.rankDisplayName}`,
      discountType: "percentage",
      discountValue: newRank.discountPercent + 5, // Thêm 5% nữa
      maxDiscountAmount: 500000, // Giảm tối đa 500k
      minOrderAmount: 100000, // Đơn tối thiểu 100k
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Hết hạn sau 30 ngày
      usageLimit: 1,
      usageLimitPerUser: 1,
      isActive: true,
      applicableUsers: [userId], // Chỉ user này dùng được
    };

    // Tạo voucher (cần implement VoucherService.createVoucher)
    // const voucher = await VoucherService.createVoucher(voucherData);

    // Gửi email thông báo thăng hạng
    await EmailService.sendRankUpEmail(user.userEmail, {
      userName: user.userName,
      rankName: newRank.rankDisplayName,
      discountPercent: newRank.discountPercent,
      benefits: newRank.benefits,
      voucherCode: voucherData.voucherCode,
      voucherDiscount: voucherData.discountValue,
      voucherExpiry: voucherData.endDate,
    });

    // Cập nhật lịch sử
    await UserRankHistory.findByIdAndUpdate(historyId, {
      voucherSent: true,
      emailSent: true,
      voucherCode: voucherData.voucherCode,
    });

    return {
      status: "OK",
      message: "Rank up rewards sent successfully",
    };
  } catch (error) {
    console.error("Error sending rank up rewards:", error);
    // Không throw error để không làm gián đoạn quá trình đặt hàng
    return {
      status: "ERR",
      message: error.message,
    };
  }
};

/**
 * Tính toán tiến độ đến rank tiếp theo
 */
const calculateProgressToNextRank = async (totalSpending, currentRank) => {
  try {
    const nextRank = await getNextRank(currentRank.priority);

    if (!nextRank) {
      return {
        hasNextRank: false,
        progress: 100,
        remainingSpending: 0,
      };
    }

    const spendingInCurrentRank = totalSpending - currentRank.minSpending;
    const requiredSpendingForNextRank =
      nextRank.minSpending - currentRank.minSpending;
    const progress = Math.min(
      100,
      (spendingInCurrentRank / requiredSpendingForNextRank) * 100
    );

    return {
      hasNextRank: true,
      nextRank,
      progress: Math.round(progress),
      remainingSpending: Math.max(0, nextRank.minSpending - totalSpending),
      currentSpending: totalSpending,
      requiredSpending: nextRank.minSpending,
    };
  } catch (error) {
    return {
      hasNextRank: false,
      progress: 0,
      remainingSpending: 0,
    };
  }
};

/**
 * Lấy rank tiếp theo
 */
const getNextRank = async (currentPriority) => {
  try {
    const nextRank = await Rank.findOne({
      priority: currentPriority + 1,
      isActive: true,
    });
    return nextRank;
  } catch (error) {
    return null;
  }
};

/**
 * Cập nhật totalSpending và kiểm tra rank
 * Được gọi sau khi hoàn thành đơn hàng
 */
const updateUserSpendingAndRank = async (userId, orderAmount) => {
  try {
    const user = await User.findById(userId).populate("currentRank");
    if (!user) {
      throw new Error("User not found");
    }

    // Cập nhật totalSpending
    user.totalSpending += orderAmount;
    await user.save();

    // Kiểm tra và cập nhật rank nếu cần
    const appropriateRank = await Rank.findRankBySpending(user.totalSpending);

    // Nếu chưa có rank hoặc rank thay đổi
    if (
      !user.currentRank ||
      user.currentRank._id.toString() !== appropriateRank._id.toString()
    ) {
      await updateUserRank(userId, appropriateRank._id);
    }

    return {
      status: "OK",
      message: "User spending and rank updated successfully",
      data: {
        totalSpending: user.totalSpending,
        currentRank: appropriateRank,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy lịch sử thăng hạng của user
 */
const getUserRankHistory = async (userId) => {
  try {
    const history = await UserRankHistory.find({ userId })
      .populate("oldRank")
      .populate("newRank")
      .sort({ createdAt: -1 });

    return {
      status: "OK",
      message: "Get user rank history successfully",
      data: history,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thống kê ranks
 */
const getRankStatistics = async () => {
  try {
    const ranks = await Rank.find().sort({ priority: 1 });

    // Lấy thống kê cho từng rank
    const statistics = await Promise.all(
      ranks.map(async (rank) => {
        // Đếm số user có rank này (currentRank là ObjectId trực tiếp)
        const userCount = await User.countDocuments({
          currentRank: rank._id,
        });

        // Tính tổng chi tiêu trung bình của các user trong rank này
        const users = await User.find({
          currentRank: rank._id,
        }).select("totalSpending");

        const totalSpending = users.reduce(
          (sum, user) => sum + (user.totalSpending || 0),
          0
        );
        const avgSpending = userCount > 0 ? totalSpending / userCount : 0;

        return {
          rank: {
            _id: rank._id,
            rankName: rank.rankName,
            rankDisplayName: rank.rankDisplayName,
            rankCode: rank.rankCode,
            color: rank.color,
            icon: rank.icon,
            discountPercent: rank.discountPercent,
            minSpending: rank.minSpending,
            maxSpending: rank.maxSpending,
          },
          userCount,
          avgSpending: Math.round(avgSpending),
          totalSpending: Math.round(totalSpending),
        };
      })
    );

    // Tổng số user có rank
    const totalUsers = statistics.reduce(
      (sum, stat) => sum + stat.userCount,
      0
    );

    return {
      status: "OK",
      message: "Get rank statistics successfully",
      data: {
        statistics,
        totalUsers,
        totalRanks: ranks.length,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Khởi tạo ranks mặc định cho hệ thống
 */
const initializeDefaultRanks = async () => {
  try {
    const existingRanks = await Rank.countDocuments();
    if (existingRanks > 0) {
      console.log("Ranks already initialized");
      return;
    }

    const defaultRanks = [
      {
        rankName: "Bronze",
        rankDisplayName: "Đồng",
        rankCode: "RANK_BRONZE",
        discountPercent: 0, // Không giảm giá
        minSpending: 0,
        maxSpending: 499999, // Dưới 500k
        priority: 1,
        color: "#CD7F32",
        icon: "🍪",
        benefits: [
          "Tích điểm thưởng cơ bản",
          "Nhận thông báo khuyến mãi",
          "Hỗ trợ khách hàng tiêu chuẩn",
        ],
        description: "Hạng thành viên mặc định cho tất cả khách hàng mới",
      },
      {
        rankName: "Silver",
        rankDisplayName: "Bạc",
        rankCode: "RANK_SILVER",
        discountPercent: 5, // Giảm 5%
        minSpending: 500000, // 500k
        maxSpending: 1499999, // Dưới 1.5 triệu
        priority: 2,
        color: "#C0C0C0",
        icon: "🍰",
        benefits: [
          "Giảm giá 5% cho mọi đơn hàng",
          "Tích điểm thưởng x1.5",
          "Ưu tiên hỗ trợ khách hàng",
          "Miễn phí vận chuyển cho đơn trên 200k",
        ],
        description:
          "Hạng thành viên bạc - Dành cho khách hàng có tổng chi tiêu từ 500.000đ",
      },
      {
        rankName: "Gold",
        rankDisplayName: "Vàng",
        rankCode: "RANK_GOLD",
        discountPercent: 10, // Giảm 10%
        minSpending: 1500000, // 1.5 triệu
        maxSpending: null, // Không giới hạn
        priority: 3,
        color: "#FFD700",
        icon: "🍫",
        benefits: [
          "Giảm giá 10% cho mọi đơn hàng",
          "Tích điểm thưởng x2",
          "Ưu tiên hỗ trợ VIP 24/7",
          "Miễn phí vận chuyển toàn bộ đơn hàng",
          "Voucher sinh nhật đặc biệt",
          "Được mời tham gia các sự kiện đặc biệt",
        ],
        description:
          "Hạng thành viên vàng - Dành cho khách hàng VIP có tổng chi tiêu từ 1.500.000đ",
      },
    ];

    await Rank.insertMany(defaultRanks);
    console.log("Default ranks initialized successfully");

    return {
      status: "OK",
      message: "Default ranks initialized successfully",
    };
  } catch (error) {
    console.error("Error initializing default ranks:", error);
    throw error;
  }
};

module.exports = {
  createRank,
  getAllRanks,
  getRankById,
  updateRank,
  deleteRank,
  getUserRank,
  updateUserRank,
  updateUserSpendingAndRank,
  getUserRankHistory,
  getRankStatistics,
  initializeDefaultRanks,
  calculateProgressToNextRank,
};
