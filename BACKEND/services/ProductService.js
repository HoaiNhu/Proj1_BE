const Product = require("../models/ProductModel");

//tạo product
const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const { name, image, type, price, countInStock, rating, description } =
      newProduct;

    try {
      //check tên sản phẩm
      const checkProduct = await Product.findOne({
        name: name,
      });
      //nếu name product đã tồn tại
      if (checkProduct !== null) {
        resolve({
          status: "OK",
          message: "The name of product is already",
        });
      }

      const createdProduct = await Product.create({
        name,
        image,
        type,
        price,
        countInStock,
        rating,
        description,
      });
      if (createdProduct) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdProduct,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update product
const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkProduct = await Product.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu product ko tồn tại
      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The product is not defined",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedProduct", updatedProduct);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedProduct,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete product
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check product created
      const checkProduct = await Product.findOne({
        _id: id,
      });
      //console.log("checkProduct", checkProduct);

      //nếu Product ko tồn tại
      if (checkProduct === null) {
        resolve({
          status: "OK",
          message: "The product is not defined",
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

//get details product
const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const product = await Product.findOne({
        _id: id,
      });

      //nếu product ko tồn tại
      if (product === null) {
        resolve({
          status: "OK",
          message: "The product is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: product,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get all product
const getAllProduct = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProduct = await Product.countDocuments();
      
      if(filter){
        const label = filter[0];
        const allProductFilter = await Product.find({ [label]: {'$regex': filter[1] } }).limit(limit).skip(page * limit) //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Product IS SUCCESS",
          data: allProductFilter,
          total: totalProduct,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit),
        });
      }

      if(sort){
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Product IS SUCCESS",
          data: allProductSort,
          total: totalProduct,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit),
        });
      }

      const allProduct = await Product.find().limit(limit).skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Product IS SUCCESS",
        data: allProduct,
        total: totalProduct,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getDetailsProduct,
  getAllProduct,
};
