const { getUserItemMatrix } = require("./GetUserItemMatrixService");
const cosineSimilarity = require("compute-cosine-similarity");

const recommend = async (userId) => {
  const matrix = await getUserItemMatrix();
  const users = Object.keys(matrix);
  if (!matrix[userId]) return [];
  const similarities = {};

  // Hàm chuyển đổi dữ liệu thành vector
  const userVector = (user, allProducts) => {
    return allProducts.map((product) => matrix[user][product] || 0);
  };

  const allProducts = [
    ...new Set(users.flatMap((user) => Object.keys(matrix[user]))),
  ];
  const targetVector = userVector(userId, allProducts);

  // Tính độ tương đồng với user khác
  for (let otherUser of users) {
    if (otherUser !== userId) {
      const otherVector = userVector(otherUser, allProducts);
      similarities[otherUser] =
        cosineSimilarity(targetVector, otherVector) || 0;
    }
  }

  // Lấy top 5 user tương tự
  const similarUsers = Object.entries(similarities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([user]) => user);

  // Đề xuất sản phẩm
  const recommendations = {};
  similarUsers.forEach((similarUser) => {
    for (let product in matrix[similarUser]) {
      if (!matrix[userId][product]) {
        recommendations[product] =
          (recommendations[product] || 0) + matrix[similarUser][product];
      }
    }
  });

  // Trả về top 5 sản phẩm
  return Object.entries(recommendations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId]) => productId);
};

module.exports = { recommend };
