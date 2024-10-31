const UserServices = require("../services/UserServices");
const JwtService = require("../services/JwtService");
const validator = require("validator");

//tạo tài khoản
const createUser = async (req, res) => {
  try {
    //console.log(req.body);
    //test input data
    const { name, phone, email, password, confirmPassword } = req.body;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //check email
    const isValidEmail = emailPattern.test(email);
    if (!name || !phone || !email || !password || !confirmPassword) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isValidEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The password is not equal confirmPassword",
      });
    }

    console.log("isValidEmail ", isValidEmail);

    const response = await UserServices.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//đăng nhập
const loginUser = async (req, res) => {
  try {
    console.log(req.body);
    //test input data
    const { name, phone, email, password, confirmPassword } = req.body;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //check email
    const isValidEmail = emailPattern.test(email);
    if (!name || !phone || !email || !password || !confirmPassword) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isValidEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The password is not equal confirmPassword",
      });
    }

    console.log("isValidEmail ", isValidEmail);

    const response = await UserServices.loginUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    //console.log("userId", userId);
    const response = await UserServices.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    //const token = req.headers;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await UserServices.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get info user
const getAllUser = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const response = await UserServices.getAllUser(Number(limit), Number(page));
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get detail user
const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await UserServices.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//cấp token mới
const refreshToken = async (req, res) => {
  try {
    const token = req.headers.token?.split(" ")[1];

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
};
