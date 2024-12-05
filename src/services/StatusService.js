const Status = require("../models/StatusModel");

//tạo Status
const createStatus = (newStatus) => {
  return new Promise(async (resolve, reject) => {
    const { statusCode, statusName } =
    newStatus;

    try {
      //check tên Status
      const checkStatus = await Status.findOne({
        name: statusName,
      });
      //nếu name Status đã tồn tại
      if (checkStatus !== null) {
        resolve({
          status: "OK",
          message: "The name of Status is already",
        });
      }

      const createdStatus = await Status.create({
        statusCode,
        statusName,
      });
      if (createdStatus) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdStatus,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update Status
const updateStatus = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkStatus = await Status.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu Status ko tồn tại
      if (checkStatus === null) {
        resolve({
          status: "OK",
          message: "The Status is not defined",
        });
      }

      const updatedStatus = await Status.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedStatus", updatedStatus);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedStatus,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete Status
const deleteStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check Status created
      const checkStatus = await Status.findOne({
        _id: id,
      });
      //console.log("checkStatus", checkStatus);

      //nếu Status ko tồn tại
      if (checkStatus === null) {
        resolve({
          status: "OK",
          message: "The Status is not defined",
        });
      }

      await Status.findByIdAndDelete(id);
      //console.log("updatedStatus", updatedStatus);
      resolve({
        status: "OK",
        message: "DELETE Status IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// //get details Status
// const getDetailsStatus = (id) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       //check email created
//       const Status = await Status.findOne({
//         _id: id,
//       });

//       //nếu Status ko tồn tại
//       if (Status === null) {
//         resolve({
//           status: "OK",
//           message: "The Status is not defined",
//         });
//       }

//       resolve({
//         status: "OK",
//         message: "SUCCESS",
//         data: Status,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

//get all Status
const getAllStatus = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalStatus = await Status.countDocuments();
      
      if(filter){
        const label = filter[0];
        const allStatusFilter = await Status.find({ [label]: {'$regex': filter[1] } }).limit(limit).skip(page * limit) //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Status IS SUCCESS",
          data: allStatusFilter,
          total: totalStatus,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalStatus / limit),
        });
      }

      if(sort){
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allStatusSort = await Status.find().limit(limit).skip(page * limit).sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Status IS SUCCESS",
          data: allStatusSort,
          total: totalStatus,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalStatus / limit),
        });
      }

      const allStatus = await Status.find().limit(limit).skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Status IS SUCCESS",
        data: allStatus,
        total: totalStatus,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalStatus / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createStatus,
  updateStatus,
  deleteStatus,
 // getDetailsStatus,
  getAllStatus,
};
