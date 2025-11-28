const Order = require("../models/OrderModel");
const Status = require("../models/StatusModel");
const UserAssetsService = require("./UserAssetsService");
const EmailService = require("./EmailService");
const mongoose = require("mongoose");
const axios = require("axios");
// Kiểm tra tồn tại đơn hàng
const checkOrderExistence = async (id) => {
  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }
  return existingOrder;
};

// Tạo đơn hàng mới
// const createOrder = (newOrder) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const createdOrder = await Order.create(newOrder);
//       if (createdOrder) {
//         resolve({
//           status: "OK",
//           message: "Order created successfully",
//           data: createdOrder,
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const createOrder = async (orderData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        shippingPrice = 30000,
        userId,
        deliveryDate,
        deliveryTime,
        orderNote = "",
        status = "PENDING",
      } = orderData;

      // Tính toán các giá trị tổng
      const totalItemPrice = orderItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const totalPrice = totalItemPrice + shippingPrice;

      // Kiểm tra dữ liệu
      if (!orderItems || orderItems.length === 0) {
        return reject({
          status: "ERR",
          message: "Order items cannot be empty",
        });
      }

      // Validate order items details
      orderItems.forEach((item) => {
        if (!item.product) {
          return reject({
            status: "ERR",
            message: "Product is required in order items",
          });
        }
        if (!item.total || isNaN(item.total)) {
          return reject({
            status: "ERR",
            message: "Total is required and must be a number in order items",
          });
        }
      });

      if (!userId) {
        // Trường hợp khách chưa đăng nhập
        if (
          !shippingAddress ||
          !shippingAddress.familyName ||
          !shippingAddress.userName ||
          !shippingAddress.userPhone ||
          !shippingAddress.userEmail ||
          !shippingAddress.userAddress
        ) {
          return reject({
            status: "ERR",
            message: "Shipping information is required for guest orders.",
          });
        }
      }

      if (!paymentMethod) {
        return reject({
          status: "ERR",
          message: "Payment method is required",
        });
      }

      // Lấy ObjectId của trạng thái
      const statusObj = await Status.findOne({ statusCode: status });
      if (!statusObj) {
        return reject({
          status: "ERR",
          message: `Status ${status} not found`,
        });
      }

      // Tạo đơn hàng
      const newOrder = await Order.create({
        orderCode: `ORD-${Date.now()}`,
        orderItems,
        shippingAddress,
        paymentMethod,
        userId: userId || null,
        shippingPrice,
        totalItemPrice,
        totalPrice,
        deliveryDate,
        deliveryTime,
        status: statusObj._id,
        orderNote,
      });

      // Gọi API FastAPI để cập nhật mô hình khuyến nghị
      try {
        await axios.post(
          `${process.env.FASTAPI_URL}/update-model`,
          {},
          {
            timeout: 30000, // 30 giây timeout
          }
        );
      } catch (error) {
        console.error("Lỗi khi cập nhật mô hình khuyến nghị:", error);
      }

      // 🔔 GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
      try {
        await EmailService.sendOrderConfirmationEmail(newOrder._id);
        console.log(
          `📧 Email xác nhận đơn hàng ${newOrder.orderCode} đã được gửi`
        );
      } catch (emailError) {
        console.error("⚠️ Không thể gửi email xác nhận:", emailError.message);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

      resolve({
        status: "OK",
        message: "Order created successfully",
        data: newOrder,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "An error occurred while creating the order",
      });
    }
  });
};

// Cập nhật thông tin đơn hàng
const updateOrder = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkOrderExistence(id); // Kiểm tra tồn tại

      const updatedOrder = await Order.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: "OK",
        message: "Order updated successfully",
        data: updatedOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Xóa đơn hàng
const deleteOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkOrderExistence(id); // Kiểm tra tồn tại

      await Order.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Order deleted successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy thông tin chi tiết đơn hàng
const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra id có hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return resolve({
          status: "ERR",
          message: "Invalid order ID format",
        });
      }

      const order = await Order.findById(id)
        .populate("orderItems.product")
        .populate("userId")
        // .populate("user")
        .populate("status");
      if (!order) {
        return resolve({
          status: "ERR",
          message: "Order not found",
        });
      }

      return resolve({
        status: "OK",
        message: "Order details retrieved successfully",
        data: order,
      });
    } catch (e) {
      console.error("Error in getOrderDetails:", e);
      return resolve({
        status: "ERR",
        message: e.message || "Error retrieving order details",
      });
    }
  });
};

// Lấy danh sách tất cả đơn hàng
// const getAllOrders = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const orders = await Order.find()
//         .populate("orderItems.product")
//         .populate("user")
//         .populate("status");
//       resolve({
//         status: "OK",
//         message: "All orders retrieved successfully",
//         data: orders,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

// Lấy danh sách tất cả đơn hàng (có phân trang và sắp xếp)
const getAllOrders = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find()
        .populate("orderItems.product")
        .populate("userId")
        .populate("status");

      resolve({
        status: "OK",
        message: "Get all Orders is SUCCESS",
        data: orders,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve orders",
      });
    }
  });
};

// Lấy danh sách đơn hàng của người dùng
const getOrdersByUser = (userId) => {
  console.log("USERID", userId);
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .populate("orderItems.product")
        .populate("status");
      resolve({
        status: "OK",
        message: "Orders by user retrieved successfully",
        data: orders,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = (id, statusId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Lấy thông tin đơn hàng cũ để có oldStatus
      const oldOrder = await Order.findById(id).populate("status");
      if (!oldOrder) {
        return reject(new Error("Order not found"));
      }

      const oldStatusCode = oldOrder.status?.statusCode || "PENDING";

      // Kiểm tra _id có hợp lệ không
      const newStatus = await Status.findById(statusId);
      if (!newStatus) {
        return reject(new Error("Invalid status ID"));
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: newStatus._id },
        { new: true }
      );

      if (!updatedOrder) {
        return reject(new Error("Order not found"));
      }

      // 🔔 GỬI EMAIL THÔNG BÁO THAY ĐỔI TRẠNG THÁI
      try {
        await EmailService.sendOrderStatusUpdateEmail(
          updatedOrder._id,
          oldStatusCode,
          newStatus.statusCode
        );
        console.log(
          `📧 Email cập nhật trạng thái đơn hàng ${updatedOrder.orderCode}: ${oldStatusCode} → ${newStatus.statusCode}`
        );
      } catch (emailError) {
        console.error(
          "⚠️ Không thể gửi email cập nhật trạng thái:",
          emailError.message
        );
        // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái
      }

      resolve(updatedOrder);
    } catch (e) {
      reject(e);
    }
  });
};

// Xác nhận thanh toán và áp dụng voucher
const confirmPaymentWithVoucher = async (orderId, userId, voucherData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate and convert orderId to ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return reject({
          status: "ERR",
          message: "Invalid order ID format",
        });
      }

      const orderObjectId = new mongoose.Types.ObjectId(orderId);
      console.log(
        "confirmPaymentWithVoucher called with orderId:",
        orderObjectId
      );

      const order = await checkOrderExistence(orderObjectId);

      // Kiểm tra quyền
      if (order.userId && order.userId.toString() !== userId.toString()) {
        return reject({
          status: "ERR",
          message: "Bạn không có quyền thay đổi đơn hàng này",
        });
      }

      const { selectedVouchers, voucherDiscount, finalTotalPrice } =
        voucherData;

      console.log(
        "selectedVouchers received:",
        JSON.stringify(selectedVouchers, null, 2)
      );
      console.log("Number of vouchers to process:", selectedVouchers.length);

      // Cập nhật order với voucher info
      const updatedOrder = await Order.findByIdAndUpdate(
        orderObjectId,
        {
          vouchersUsed: selectedVouchers.map((v) => ({
            voucherId: v._id,
            voucherCode: v.voucherCode,
            voucherName: v.voucherName,
            voucherType: v.voucherType,
            discountAmount: v.discountAmount || 0,
          })),
          voucherDiscount: voucherDiscount || 0,
          totalPrice: finalTotalPrice,
        },
        { new: true }
      ).populate("vouchersUsed.voucherId");

      // Mark vouchers as used
      const UserVoucher = require("../models/UserVoucherModel");
      const Voucher = require("../models/VoucherModel");
      const VoucherUsageHistory = require("../models/VoucherUsageHistoryModel");

      for (const voucher of selectedVouchers) {
        console.log("\n=== Processing voucher ===");
        console.log("voucher object:", JSON.stringify(voucher, null, 2));
        console.log("voucher._id:", voucher._id, "type:", typeof voucher._id);

        try {
          // Convert IDs to ObjectId
          const userIdObj = new mongoose.Types.ObjectId(userId);
          const voucherIdObj = new mongoose.Types.ObjectId(voucher._id);

          console.log("Searching UserVoucher with:", {
            userId: userIdObj,
            voucherId: voucherIdObj,
            status: "ACTIVE",
          });

          // Tìm UserVoucher
          const userVoucher = await UserVoucher.findOne({
            userId: userIdObj,
            voucherId: voucherIdObj,
            status: "ACTIVE",
          });

          if (!userVoucher) {
            console.error("❌ UserVoucher not found for:", {
              userId: userIdObj,
              voucherId: voucherIdObj,
            });

            // Kiểm tra xem có UserVoucher nào không?
            const anyUserVoucher = await UserVoucher.findOne({
              userId: userIdObj,
              voucherId: voucherIdObj,
            });
            console.error(
              "Any UserVoucher (any status):",
              anyUserVoucher
                ? {
                    id: anyUserVoucher._id,
                    status: anyUserVoucher.status,
                    orderId: anyUserVoucher.orderId,
                  }
                : "Not found"
            );

            continue;
          }

          console.log("✓ Found UserVoucher:", {
            id: userVoucher._id,
            status: userVoucher.status,
            currentOrderId: userVoucher.orderId,
          });

          // Mark as USED using method - use orderObjectId
          await userVoucher.markAsUsed(orderObjectId);
          console.log("UserVoucher marked as USED:", {
            userVoucherId: userVoucher._id,
            orderId: orderObjectId,
            status: userVoucher.status,
          });

          // Tìm Voucher và tăng usedQuantity
          const voucherDoc = await Voucher.findById(voucher._id);
          if (voucherDoc) {
            await voucherDoc.incrementUsed();
            console.log("Voucher usedQuantity incremented:", {
              voucherId: voucherDoc._id,
              usedQuantity: voucherDoc.usedQuantity,
            });
          } else {
            console.error("Voucher not found:", voucher._id);
          }

          // Tạo VoucherUsageHistory - use orderObjectId
          const usageHistory = await VoucherUsageHistory.create({
            userId: new mongoose.Types.ObjectId(userId),
            voucherId: new mongoose.Types.ObjectId(voucher._id),
            userVoucherId: userVoucher._id,
            orderId: orderObjectId,
            originalOrderValue: order.totalItemPrice + order.shippingPrice,
            discountAmount: voucher.discountAmount || 0,
            finalOrderValue: finalTotalPrice,
            voucherCode: voucher.voucherCode,
            voucherType: voucher.voucherType,
            usedAt: new Date(),
          });
          console.log("VoucherUsageHistory created:", {
            historyId: usageHistory._id,
            orderId: usageHistory.orderId,
            userId: usageHistory.userId,
          });
        } catch (voucherError) {
          console.error("Error processing voucher:", {
            voucherId: voucher._id,
            error: voucherError.message,
            stack: voucherError.stack,
          });
          // Continue processing other vouchers
        }
      }

      resolve({
        status: "OK",
        message: "Xác nhận thanh toán thành công",
        data: updatedOrder,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Có lỗi xảy ra khi xác nhận thanh toán",
      });
    }
  });
};

// Đổi xu thành tiền cho đơn hàng
const applyCoinsToOrder = async (orderId, userId, coinsToUse) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await checkOrderExistence(orderId);

      // Kiểm tra đơn hàng thuộc về user
      if (order.userId && order.userId.toString() !== userId.toString()) {
        return reject({
          status: "ERR",
          message: "Bạn không có quyền thay đổi đơn hàng này",
        });
      }

      // Kiểm tra số xu hợp lệ
      if (!coinsToUse || coinsToUse < 0) {
        return reject({
          status: "ERR",
          message: "Số xu phải lớn hơn hoặc bằng 0",
        });
      }

      // Kiểm tra số xu hiện có của user
      const userCoins = await UserAssetsService.checkCoins(userId);
      if (userCoins < coinsToUse) {
        return reject({
          status: "ERR",
          message: `Bạn chỉ có ${userCoins} xu, không đủ để sử dụng ${coinsToUse} xu`,
        });
      }

      // Kiểm tra số xu không vượt quá tổng tiền đơn hàng
      const maxCoinsCanUse = order.totalItemPrice + order.shippingPrice;
      if (coinsToUse > maxCoinsCanUse) {
        return reject({
          status: "ERR",
          message: `Số xu tối đa có thể sử dụng là ${maxCoinsCanUse} xu`,
        });
      }

      // Cập nhật đơn hàng với số xu mới
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          coinsUsed: coinsToUse,
          totalPrice: order.totalItemPrice + order.shippingPrice - coinsToUse,
        },
        { new: true }
      );

      // Trừ xu từ tài khoản user
      if (coinsToUse > 0) {
        await UserAssetsService.deductCoins(userId, coinsToUse);
      }

      resolve({
        status: "OK",
        message: `Đã áp dụng ${coinsToUse} xu cho đơn hàng`,
        data: {
          order: updatedOrder,
          coinsUsed: coinsToUse,
          remainingCoins: userCoins - coinsToUse,
          newTotalPrice: updatedOrder.totalPrice,
        },
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Có lỗi xảy ra khi áp dụng xu",
      });
    }
  });
};

// Lấy danh sách các khuyến mãi và gán giá trị khuyến mãi cho order
// Lấy top 5 đơn hàng mới nhất
const getRecentOrders = (limit = 5) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find()
        .populate("orderItems.product", "name images price")
        .populate("userId", "name email")
        .populate("status", "statusName statusCode")
        .sort({ createdAt: -1 })
        .limit(limit);

      resolve({
        status: "OK",
        message: `Top ${limit} recent orders retrieved successfully`,
        data: orders,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve recent orders",
      });
    }
  });
};

// Lấy top 10 sản phẩm bán chạy nhất
const getBestSellingProducts = (limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bestSelling = await Order.aggregate([
        // Unwind orderItems array để xử lý từng sản phẩm
        { $unwind: "$orderItems" },

        // Group theo product và tính tổng quantity
        {
          $group: {
            _id: "$orderItems.product",
            totalQuantitySold: { $sum: "$orderItems.quantity" },
            totalRevenue: { $sum: "$orderItems.total" },
            orderCount: { $sum: 1 },
          },
        },

        // Sort theo quantity bán được (giảm dần)
        { $sort: { totalQuantitySold: -1 } },

        // Limit kết quả
        { $limit: limit },

        // Lookup để lấy thông tin chi tiết sản phẩm
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },

        // Unwind productDetails
        { $unwind: "$productDetails" },

        // Project các field cần thiết
        {
          $project: {
            _id: 1,
            totalQuantitySold: 1,
            totalRevenue: 1,
            orderCount: 1,
            productName: "$productDetails.name",
            productImages: "$productDetails.images",
            productPrice: "$productDetails.price",
            productType: "$productDetails.type",
          },
        },
      ]);

      resolve({
        status: "OK",
        message: `Top ${limit} best selling products retrieved successfully`,
        data: bestSelling,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve best selling products",
      });
    }
  });
};

// Lấy danh sách đơn hàng tạo trong tuần hiện tại (Mon 00:00 - Sun 23:59:59.999)
const getWeeklyNewOrders = () => {
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

      const orders = await Order.find({
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      })
        .populate("orderItems.product", "name images price")
        .populate("userId", "name email")
        .populate("status", "statusName statusCode")
        .sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Weekly new orders retrieved successfully",
        total: orders.length,
        data: orders,
        range: { start: startOfWeek, end: endOfWeek },
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve weekly new orders",
      });
    }
  });
};

// Lấy đơn hàng tạo trong tuần trước (Mon 00:00 - Sun 23:59:59.999 của tuần trước)
const getPreviousWeekNewOrders = () => {
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

      const orders = await Order.find({
        createdAt: { $gte: startOfPrevWeek, $lte: endOfPrevWeek },
      })
        .populate("orderItems.product", "name images price")
        .populate("userId", "name email")
        .populate("status", "statusName statusCode")
        .sort({ createdAt: -1 });

      resolve({
        status: "OK",
        message: "Previous week new orders retrieved successfully",
        total: orders.length,
        data: orders,
        range: { start: startOfPrevWeek, end: endOfPrevWeek },
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Failed to retrieve previous week orders",
      });
    }
  });
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
  applyCoinsToOrder,
  confirmPaymentWithVoucher,
  getRecentOrders,
  getBestSellingProducts,
  getWeeklyNewOrders,
  getPreviousWeekNewOrders,
};
