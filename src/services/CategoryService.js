const Category = require("../models/CategoryModel");

//tạo product
const createCategory = (newCategory) => {
  return new Promise(async (resolve, reject) => {
    const { code, name,description } =
    newCategory;

    try {
      //check tên sản phẩm
      const checkCategory = await Category.findOne({
        name: name,
      });
      //nếu name category đã tồn tại
      if (checkCategory !== null) {
        resolve({
          status: "OK",
          message: "The name of category is already",
        });
      }

      const createdCategory = await Category.create({
        code,
        name,
        description,
      });
      if (createdCategory) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdCategory,
        });
      }
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
      //console.log("updatedProduct", updatedProduct);
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

//delete product
const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check product created
      const checkCategory = await Category.findOne({
        _id: id,
      });
      //console.log("checkProduct", checkProduct);

      //nếu Product ko tồn tại
      if (checkCategory === null) {
        resolve({
          status: "OK",
          message: "The category is not defined",
        });
      }

      await Product.findByIdAndDelete(id);
      //console.log("updatedProduct", updatedProduct);
      resolve({
        status: "OK",
        message: "DELETE Product IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// //get details product
// const getDetailsProduct = (id) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       //check email created
//       const product = await Product.findOne({
//         _id: id,
//       });

//       //nếu product ko tồn tại
//       if (product === null) {
//         resolve({
//           status: "OK",
//           message: "The product is not defined",
//         });
//       }

//       resolve({
//         status: "OK",
//         message: "SUCCESS",
//         data: product,
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
        const allCategorySort = await Product.find().limit(limit).skip(page * limit).sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Product IS SUCCESS",
          data: allCategorySort,
          total: totalCategory,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit),
        });
      }

      const allCategory = await Product.find().limit(limit).skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Product IS SUCCESS",
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
 // getDetailsProduct,
  getAllCategory,
};
