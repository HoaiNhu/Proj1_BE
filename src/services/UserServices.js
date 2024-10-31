const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken } = require("./JwtService");

//tạo user
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, phone, email, password, confirmPassword } = newUser;
    try {
      //check email created
      const checkUser = await User.findOne({
        email: email,
      });
      //nếu email đã tồn tại
      if (checkUser !== null) {
        resolve({
          status: "OK",
          message: "The email is already",
        });
      }
      //mã hóa password
      const hash = bcrypt.hashSync(password, 10);
      console.log("hash", hash);
      const createdUser = await User.create({
        name,
        phone,
        email,
        password: hash,
        // confirmPassword
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//log in user
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { name, phone, email, password, confirmPassword } = userLogin;
    try {
      //check email created
      const checkUser = await User.findOne({
        email: email,
      });
      //nếu email đã tồn tại
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      //console.log("comparePassword ", comparePassword);

      if (!comparePassword) {
        resolve({
          status: "OK",
          message: "The password or user is incorrect",
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

      //console.log("access_token ", access_token);

      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//update user
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkUser = await User.findOne({
        _id: id,
      });
      console.log("checkUser", checkUser);

      //nếu user ko tồn tại
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      console.log("updatedUser", updatedUser);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete user
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkUser = await User.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu user ko tồn tại
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      await User.findByIdAndDelete(id);
      //console.log("updatedUser", updatedUser);
      resolve({
        status: "OK",
        message: "DELETE USER IS SUCCESS",
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
      const totalUser = await User.countDocuments();
      const allUser = await User.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all USER IS SUCCESS",
        data: allUser,
        total: totalUser,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalUser / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get details user
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const user = await User.findOne({
        _id: id,
      });

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

//tạo access token dựa vào refresh token

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
};
