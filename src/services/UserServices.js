const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

//tạo user
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const {
      familyName,
      userName,
      userPhone,
      userEmail,
      userPassword,
      userConfirmPassword,
      userAddress,
      userWard,
      userDistrict,
      userCity,
      userImage,
      isAdmin,
    } = newUser;

    try {
      // Check if the email already exists
      const checkUser = await User.findOne({ email: userEmail });
      if (checkUser) {
        return reject({
          status: "ERR",
          message: "The email is already registered",
        });
      }

      // Validate passwords
      if (userPassword !== userConfirmPassword) {
        return reject({
          status: "ERR",
          message: "Passwords do not match",
        });
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(userPassword, 10);

      // Create the user
      const createdUser = await User.create({
        familyName,
        userName,
        userPhone,
        userEmail,
        userPassword: hashedPassword,
        userConfirmPassword,
        userAddress,
        userWard,
        userDistrict,
        userCity,
        userImage,
        isAdmin,
      });

      resolve({
        status: "OK",
        message: "User successfully created",
        data: createdUser,
      });
    } catch (e) {
      // Kiểm tra lỗi MongoDB
      if (e.code === 11000) {
        reject({
          status: "ERR",
          message: "The email is already registered",
        });
      } else {
        reject({
          status: "ERR",
          message: "An error occurred while creating the user",
          error: e.message,
        });
      }
    }
  });
};

//log in user
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { userEmail, userPassword } = userLogin;

    try {
      // Check if the user exists
      const checkUser = await User.findOne({ userEmail });
      // console.log("userEmail: ", userEmail);

      if (!checkUser) {
        return reject({
          status: "ERR",
          message: "User not found",
        });
      }

      // Compare passwords
      const comparePassword = bcrypt.compareSync(
        userPassword,
        checkUser.userPassword
      );
      if (!comparePassword) {
        return reject({
          status: "ERR",
          message: "Incorrect password",
        });
      }

      const access_token = await generalAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: "OK",
        message: "Login successful",
        access_token,
        refresh_token,
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      reject({
        status: "ERR",
        message: "Internal Server Error",
      });
    }
  });
};

//update user
// updateUser
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);
      if (!checkUser) {
        return reject({
          status: "ERR",
          message: "User not found",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: "OK",
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// deleteUser
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);
      if (!checkUser) {
        return reject({
          status: "ERR",
          message: "User not found",
        });
      }

      const deletedUser = await User.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "User deleted successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get info user
const getAllUser = (limit = 4, page = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Order = require("../models/OrderModel");

      const totalUser = await User.countDocuments();
      const allUser = await User.find()
        .populate({
          path: "currentRank",
          select:
            "rankName rankDisplayName rankCode discountPercent minSpending maxSpending priority color icon benefits description",
        })
        .limit(limit)
        .skip(page * limit)
        .lean(); // Sử dụng lean() để cải thiện performance

      // Đếm số đơn hàng cho mỗi user
      const usersWithOrders = await Promise.all(
        allUser.map(async (user) => {
          const orderCount = await Order.countDocuments({ userId: user._id });

          // Debug log
          if (user.currentRank) {
            console.log(
              `👥 User ${user.userName} - Rank:`,
              user.currentRank.rankDisplayName,
              "Orders:",
              orderCount
            );
          }

          return {
            ...user,
            orderCount, // Thêm field orderCount
          };
        })
      );

      console.log(
        `📋 Total users: ${totalUser}, Fetched: ${usersWithOrders.length}`
      );

      resolve({
        status: "OK",
        message: "Get all USER IS SUCCESS",
        data: usersWithOrders,
        total: totalUser,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalUser / limit),
      });
    } catch (e) {
      console.error("❌ Error in getAllUser:", e);
      reject(e);
    }
  });

  // return new Promise(async (resolve, reject) => {
  //   try {
  //     const allUser = await User.find(); // Lấy tất cả dữ liệu từ collection
  //     resolve({
  //       status: "OK",
  //       message: "Get all User IS SUCCESS",
  //       data: allUser,
  //     });
  //   } catch (e) {
  //     reject(e);
  //   }
  // });
};

//get details user
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const user = await User.findOne({
        _id: id,
      });

      // console.log("user", user);
      //nếu user ko tồn tại
      if (user === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// get users created in current week (Mon 00:00 to Sun 23:59:59.999)
const getWeeklyNewUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const day = now.getDay(); // 0=Sun,1=Mon,...
      const diffToMonday = (day + 6) % 7; // days since Monday
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - diffToMonday);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const users = await User.find({
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      }).sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Weekly new users retrieved successfully",
        total: users.length,
        data: users,
        range: { start: startOfWeek, end: endOfWeek },
      });
    } catch (e) {
      reject(e);
    }
  });
};

// get users created in previous week (Mon 00:00 to Sun 23:59:59.999 of last week)
const getPreviousWeekNewUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfThisWeek.setDate(now.getDate() - diffToMonday);

      const startOfPrevWeek = new Date(startOfThisWeek);
      startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);

      const endOfPrevWeek = new Date(startOfPrevWeek);
      endOfPrevWeek.setDate(startOfPrevWeek.getDate() + 6);
      endOfPrevWeek.setHours(23, 59, 59, 999);

      const users = await User.find({
        createdAt: { $gte: startOfPrevWeek, $lte: endOfPrevWeek },
      }).sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Previous week new users retrieved successfully",
        total: users.length,
        data: users,
        range: { start: startOfPrevWeek, end: endOfPrevWeek },
      });
    } catch (e) {
      reject(e);
    }
  });
};

//tạo access token dựa vào refresh token

// forgotPassword
const forgotPassword = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      resolve({
        status: "OK",
        message: "Password reset link sent successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// resetPassword
const resetPassword = (token, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      resolve({
        status: "OK",
        message: "Password reset successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// changePassword
const changePassword = (userId, oldPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.put(`/api/users/${userId}/change-password`, {
        oldPassword,
        newPassword,
      });
      resolve({
        status: "OK",
        message: "Password changed successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// updateUserRole
const updateUserRole = (userId, newRole) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.put(`/api/users/${userId}/role`, {
        role: newRole,
      });
      resolve({
        status: "OK",
        message: "User role updated successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// updateAvatar
const updateAvatar = (userId, avatarFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await axios.put(
        `/api/users/${userId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      resolve({
        status: "OK",
        message: "Avatar updated successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// getOrderHistory
const getOrderHistory = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`/api/orders/${userId}/history`);
      resolve({
        status: "OK",
        message: "Order history retrieved successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// getOrderDetails
const getOrderDetails = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      resolve({
        status: "OK",
        message: "Order details retrieved successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// getAllNews
const getAllNews = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get("/api/news");
      resolve({
        status: "OK",
        message: "News retrieved successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

// getIntroduce
const getIntroduce = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get("/api/introduce");
      resolve({
        status: "OK",
        message: "Introduction retrieved successfully",
        data: response.data,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.response ? e.response.data : e.message,
      });
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  getWeeklyNewUsers,
  getPreviousWeekNewUsers,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserRole,
  updateAvatar,
  getOrderHistory,
  getOrderDetails,
  getAllNews,
  getIntroduce,
};
