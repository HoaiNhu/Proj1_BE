const VoucherService = require("../services/VoucherService");

// ========== ADMIN CONTROLLERS ==========

// Tạo voucher mới
const createVoucher = async (req, res) => {
  try {
    const data = req.body;

    // Parse JSON fields từ FormData
    if (
      data.applicableProducts &&
      typeof data.applicableProducts === "string"
    ) {
      try {
        data.applicableProducts = JSON.parse(data.applicableProducts);
      } catch (e) {
        data.applicableProducts = [];
      }
    }

    if (
      data.applicableCategories &&
      typeof data.applicableCategories === "string"
    ) {
      try {
        data.applicableCategories = JSON.parse(data.applicableCategories);
      } catch (e) {
        data.applicableCategories = [];
      }
    }

    if (data.tags && typeof data.tags === "string") {
      try {
        data.tags = JSON.parse(data.tags);
      } catch (e) {
        data.tags = [];
      }
    }

    // Nếu có file ảnh thì gán vào voucherImage
    if (req.file) {
      data.voucherImage = req.file.path;
    }

    // Get admin ID from token
    if (req.user && req.user.id) {
      data.createdBy = req.user.id;
    }

    const result = await VoucherService.createVoucher(data);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Tạo voucher hàng loạt
const createBulkVouchers = async (req, res) => {
  try {
    const data = req.body;

    // Parse JSON fields từ FormData
    if (data.tags && typeof data.tags === "string") {
      try {
        data.tags = JSON.parse(data.tags);
      } catch (e) {
        data.tags = [];
      }
    }

    // Nếu có file ảnh thì gán vào voucherImage
    if (req.file) {
      data.voucherImage = req.file.path;
    }

    // Get admin ID from token
    if (req.user && req.user.id) {
      data.createdBy = req.user.id;
    }

    const result = await VoucherService.createBulkVouchers(data);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Parse JSON fields từ FormData
    if (
      data.applicableProducts &&
      typeof data.applicableProducts === "string"
    ) {
      try {
        data.applicableProducts = JSON.parse(data.applicableProducts);
      } catch (e) {
        data.applicableProducts = [];
      }
    }

    if (
      data.applicableCategories &&
      typeof data.applicableCategories === "string"
    ) {
      try {
        data.applicableCategories = JSON.parse(data.applicableCategories);
      } catch (e) {
        data.applicableCategories = [];
      }
    }

    if (data.voucherTags && typeof data.voucherTags === "string") {
      try {
        data.voucherTags = JSON.parse(data.voucherTags);
      } catch (e) {
        data.voucherTags = [];
      }
    }

    // Nếu có file ảnh mới
    if (req.file) {
      data.voucherImage = req.file.path;
    }

    const result = await VoucherService.updateVoucher(id, data);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await VoucherService.deleteVoucher(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy chi tiết voucher
const getVoucherDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await VoucherService.getVoucherDetails(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy tất cả voucher (với phân trang, lọc, sắp xếp)
const getAllVouchers = async (req, res) => {
  try {
    const { limit = 10, page = 0, sort, filter } = req.query;
    const parsedSort = sort ? JSON.parse(sort) : null;
    const parsedFilter = filter ? JSON.parse(filter) : null;

    const result = await VoucherService.getAllVouchers(
      parseInt(limit),
      parseInt(page),
      parsedSort,
      parsedFilter
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Toggle trạng thái voucher
const toggleVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await VoucherService.toggleVoucherStatus(id);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// ========== USER CONTROLLERS ==========

// Lấy danh sách voucher công khai
const getPublicVouchers = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const result = await VoucherService.getPublicVouchers(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// User claim voucher
const claimVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.body;

    const result = await VoucherService.claimVoucher(userId, voucherId);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Lấy voucher của user
const getUserVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const result = await VoucherService.getUserVouchers(userId, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Validate voucher code
const validateVoucherCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const result = await VoucherService.validateVoucherCode(userId, code);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// Áp dụng vouchers vào order
const applyVouchersToOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherIds, orderData } = req.body;

    const result = await VoucherService.applyVouchersToOrder(
      userId,
      voucherIds,
      orderData
    );
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// ========== EMAIL CONTROLLERS ==========

// Gửi voucher qua email
const sendVoucherEmail = async (req, res) => {
  try {
    const { voucherId, emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Danh sách email không hợp lệ!",
      });
    }

    const result = await VoucherService.sendVoucherEmail(voucherId, emails);
    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

// ========== STATISTICS CONTROLLERS ==========

// Lấy thống kê voucher
const getVoucherStatistics = async (req, res) => {
  try {
    const result = await VoucherService.getVoucherStatistics();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
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

  // Email
  sendVoucherEmail,

  // Statistics
  getVoucherStatistics,
};
