const Category = require("../models/CategoryModel");

//tạo Category
//create category
const createCategory = (newCategory) => {
  return new Promise(async (resolve, reject) => {
    const { code, name, description } = newCategory;

    try {
      const checkCategory = await Category.findOne({ name });
      if (checkCategory) {
        reject({ status: "ERR", message: "Category name already exists" });
        return;
      }

      const createdCategory = await Category.create({ code, name, description });
      resolve({ status: "OK", message: "Category created successfully", data: createdCategory });
    } catch (e) {
      reject(e);
    }
  });
};


//update category
const updateCategory = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkCategory = await Category.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu category ko tồn tại
      if (checkCategory === null) {
        resolve({
          status: "OK",
          message: "The category is not defined",
        });
      }

      const updatedCategory = await Category.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedCategory", updatedCategory);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedCategory,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete category
const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check category created
      const checkCategory = await Category.findOne({
        _id: id,
      });
      //console.log("checkCategory", checkCategory);

      //nếu category ko tồn tại
      if (checkCategory === null) {
        resolve({
          status: "OK",
          message: "The category is not defined",
        });
      }

      await Category.findByIdAndDelete(id);
      //console.log("updatedCategory", updatedCategory);
      resolve({
        status: "OK",
        message: "DELETE Category IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// //get details Category
// const getDetailsCategory = (id) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       //check email created
//       const Category = await Category.findOne({
//         _id: id,
//       });

//       //nếu Category ko tồn tại
//       if (Category === null) {
//         resolve({
//           status: "OK",
//           message: "The Category is not defined",
//         });
//       }

//       resolve({
//         status: "OK",
//         message: "SUCCESS",
//         data: Category,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

//get all category
const getAllCategory = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalCategory = await Category.countDocuments();
      
      if(filter){
        const label = filter[0];
        const allCategoryFilter = await Category.find({ [label]: {'$regex': filter[1] } }).limit(limit).skip(page * limit) //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Category IS SUCCESS",
          data: allCategoryFilter,
          total: totalCategory,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalCategory / limit),
        });
      }

      if(sort){
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allCategorySort = await Category.find().limit(limit).skip(page * limit).sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Category IS SUCCESS",
          data: allCategorySort,
          total: totalCategory,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalCategory / limit),
        });
      }

      const allCategory = await Category.find().limit(limit).skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Category IS SUCCESS",
        data: allCategory,
        total: totalCategory,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalCategory / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
 // getDetailsCategory,
  getAllCategory,
};
