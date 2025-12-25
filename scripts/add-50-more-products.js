require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/ProductModel");
const Category = require("../src/models/CategoryModel");

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

// 50 sản phẩm MỚI (không trùng với 20 sản phẩm đã có)
const newProducts = [
  {
    productName: "Bánh Mousse Dâu Tây",
    productPrice: 78000,
    productImage:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
    productSize: 300,
    productQuantity: 32,
    productDescription:
      "Bánh mousse dâu tây tươi mát với lớp bánh mềm và kem dâu thơm ngon.",
    productDiscount: 7,
    averageRating: 4.8,
    totalRatings: 17,
  },
  {
    productName: "Bánh Biscotti Hạnh Nhân",
    productPrice: 35000,
    productImage:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
    productSize: 140,
    productQuantity: 88,
    productDescription:
      "Bánh biscotti Ý giòn tan với hạnh nhân thơm bùi, thích hợp nhúng cà phê.",
    productDiscount: 0,
    averageRating: 4.5,
    totalRatings: 23,
  },
  {
    productName: "Bánh Madeleine",
    productPrice: 38000,
    productImage:
      "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400",
    productSize: 120,
    productQuantity: 72,
    productDescription:
      "Bánh Madeleine Pháp hình vỏ sò xinh xắn, mềm xốp thơm bơ chanh.",
    productDiscount: 0,
    averageRating: 4.7,
    totalRatings: 19,
  },
  {
    productName: "Bánh Flan Caramel",
    productPrice: 32000,
    productImage:
      "https://images.unsplash.com/photo-1626200032082-2be28a14aefc?w=400",
    productSize: 180,
    productQuantity: 65,
    productDescription:
      "Bánh flan caramel mịn màng tan chảy với vị ngọt dịu nhẹ.",
    productDiscount: 0,
    averageRating: 4.6,
    totalRatings: 28,
  },
  {
    productName: "Bánh Pudding Bread",
    productPrice: 45000,
    productImage:
      "https://images.unsplash.com/photo-1612182062631-5d3e6970e876?w=400",
    productSize: 250,
    productQuantity: 44,
    productDescription:
      "Bánh pudding bread ấm nóng với nho khô và sốt vani thơm lừng.",
    productDiscount: 5,
    averageRating: 4.7,
    totalRatings: 15,
  },
  {
    productName: "Bánh Sừng Bò Truyền Thống",
    productPrice: 42000,
    productImage:
      "https://images.unsplash.com/photo-1623334044303-241021148842?w=400",
    productSize: 160,
    productQuantity: 68,
    productDescription:
      "Bánh sừng bò giòn rụm nhiều lớp với bơ thơm ngon, món ăn sáng hoàn hảo.",
    productDiscount: 0,
    averageRating: 4.8,
    totalRatings: 31,
  },
  {
    productName: "Bánh Nho Khô",
    productPrice: 36000,
    productImage:
      "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400",
    productSize: 200,
    productQuantity: 75,
    productDescription:
      "Bánh mềm xốp với nho khô ngọt ngào, bổ dưỡng và thơm ngon.",
    productDiscount: 0,
    averageRating: 4.5,
    totalRatings: 26,
  },
  {
    productName: "Bánh Chuối Chocolate Chip",
    productPrice: 40000,
    productImage:
      "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400",
    productSize: 220,
    productQuantity: 58,
    productDescription:
      "Bánh chuối thơm nức với chocolate chip ngọt ngào, ẩm mềm không khô.",
    productDiscount: 8,
    averageRating: 4.9,
    totalRatings: 22,
  },
  {
    productName: "Bánh Bơ Đậu Phộng",
    productPrice: 33000,
    productImage:
      "https://images.unsplash.com/photo-1584627000737-2eb9c036084d?w=400",
    productSize: 150,
    productQuantity: 82,
    productDescription: "Bánh bơ đậu phộng giòn tan với vị béo bùi đặc trưng.",
    productDiscount: 0,
    averageRating: 4.6,
    totalRatings: 20,
  },
  {
    productName: "Bánh Carrot Cake",
    productPrice: 68000,
    productImage:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400",
    productSize: 320,
    productQuantity: 36,
    productDescription:
      "Bánh cà rốt thơm mềm với kem cheese, óc chó và quế thơm nồng.",
    productDiscount: 10,
    averageRating: 4.8,
    totalRatings: 24,
  },
  {
    productName: "Bánh Financier Hạnh Nhân",
    productPrice: 48000,
    productImage:
      "https://images.unsplash.com/photo-1587241321921-91a834d82209?w=400",
    productSize: 130,
    productQuantity: 54,
    productDescription:
      "Bánh financier Pháp với bột hạnh nhân thơm bùi và bơ nâu đặc biệt.",
    productDiscount: 0,
    averageRating: 4.7,
    totalRatings: 16,
  },
  {
    productName: "Bánh Canelé Bordeaux",
    productPrice: 52000,
    productImage:
      "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400",
    productSize: 100,
    productQuantity: 48,
    productDescription:
      "Bánh canelé Pháp với vỏ giòn caramel và ruột mềm vani rum.",
    productDiscount: 5,
    averageRating: 4.9,
    totalRatings: 18,
  },
  {
    productName: "Bánh Palmier Đường",
    productPrice: 30000,
    productImage:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    productSize: 120,
    productQuantity: 90,
    productDescription:
      "Bánh palmier hình tai voi với lớp đường caramel giòn tan.",
    productDiscount: 0,
    averageRating: 4.5,
    totalRatings: 33,
  },
  {
    productName: "Bánh Basque Burnt Cheesecake",
    productPrice: 88000,
    productImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
    productSize: 350,
    productQuantity: 28,
    productDescription:
      "Cheesecake Basque đặc trưng với bề mặt cháy thơm và ruột mềm kem.",
    productDiscount: 12,
    averageRating: 5.0,
    totalRatings: 29,
  },
  {
    productName: "Bánh Dacquoise Hạt Dẻ",
    productPrice: 75000,
    productImage:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500",
    productSize: 280,
    productQuantity: 35,
    productDescription:
      "Bánh dacquoise Pháp giòn nhẹ với kem bơ hạt dẻ thơm béo.",
    productDiscount: 8,
    averageRating: 4.8,
    totalRatings: 21,
  },
  {
    productName: "Bánh Sacher Áo",
    productPrice: 92000,
    productImage:
      "https://images.unsplash.com/photo-1607920592149-d05e12d00d3a?w=400",
    productSize: 340,
    productQuantity: 24,
    productDescription:
      "Bánh Sacher Áo truyền thống với chocolate đậm đà và mứt apricot.",
    productDiscount: 10,
    averageRating: 4.9,
    totalRatings: 27,
  },
  {
    productName: "Bánh Fraisier Pháp",
    productPrice: 85000,
    productImage:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500",
    productSize: 320,
    productQuantity: 30,
    productDescription:
      "Bánh Fraisier với dâu tây tươi và kem mousseline vani thơm mềm.",
    productDiscount: 7,
    averageRating: 5.0,
    totalRatings: 25,
  },
  {
    productName: "Bánh Mille-Feuille",
    productPrice: 78000,
    productImage:
      "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=500",
    productSize: 260,
    productQuantity: 32,
    productDescription:
      "Bánh nghìn lớp với kem patisserie vani và fondant trắng tinh khôi.",
    productDiscount: 5,
    averageRating: 4.8,
    totalRatings: 22,
  },
  {
    productName: "Bánh Paris-Brest",
    productPrice: 68000,
    productImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=450",
    productSize: 240,
    productQuantity: 38,
    productDescription:
      "Bánh Paris-Brest hình bánh xe với kem bơ hạt dẻ praline thơm nức.",
    productDiscount: 0,
    averageRating: 4.7,
    totalRatings: 19,
  },
  {
    productName: "Bánh Saint-Honoré",
    productPrice: 95000,
    productImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    productSize: 360,
    productQuantity: 22,
    productDescription:
      "Bánh Saint-Honoré xa hoa với puff pastry, choux và kem chiboust.",
    productDiscount: 15,
    averageRating: 5.0,
    totalRatings: 31,
  },
  {
    productName: "Bánh Clafoutis Cherry",
    productPrice: 58000,
    productImage:
      "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=500",
    productSize: 270,
    productQuantity: 42,
    productDescription:
      "Bánh clafoutis Pháp với cherry tươi trong custard mềm mịn.",
    productDiscount: 5,
    averageRating: 4.6,
    totalRatings: 18,
  },
  {
    productName: "Bánh Tarte Tatin",
    productPrice: 72000,
    productImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500",
    productSize: 300,
    productQuantity: 34,
    productDescription:
      "Bánh tart táo úp ngược với caramel thơm béo và táo mềm ngọt.",
    productDiscount: 8,
    averageRating: 4.9,
    totalRatings: 23,
  },
  {
    productName: "Bánh Religieuse Chocolate",
    productPrice: 62000,
    productImage:
      "https://images.unsplash.com/photo-1612201142855-96d0d3a06fea?w=500",
    productSize: 200,
    productQuantity: 46,
    productDescription:
      "Bánh religieuse hình nữ tu với choux phủ fondant chocolate.",
    productDiscount: 0,
    averageRating: 4.7,
    totalRatings: 20,
  },
  {
    productName: "Bánh Tarte Citron",
    productPrice: 68000,
    productImage:
      "https://images.unsplash.com/photo-1519869325930-281384150729?w=500",
    productSize: 280,
    productQuantity: 40,
    productDescription:
      "Bánh tart chanh chua ngọt với meringue mềm trắng như tuyết.",
    productDiscount: 7,
    averageRating: 4.8,
    totalRatings: 24,
  },
  {
    productName: "Bánh Kouign-Amann",
    productPrice: 48000,
    productImage:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
    productSize: 170,
    productQuantity: 52,
    productDescription:
      "Bánh Kouign-Amann Brittany với lớp caramel giòn và bơ thơm nức.",
    productDiscount: 0,
    averageRating: 4.9,
    totalRatings: 26,
  },
  {
    productName: "Bánh Gâteau Basque",
    productPrice: 65000,
    productImage:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
    productSize: 290,
    productQuantity: 38,
    productDescription:
      "Bánh Gâteau Basque với nhân kem pastry cream hoặc mứt cherry đen.",
    productDiscount: 5,
    averageRating: 4.7,
    totalRatings: 17,
  },
  {
    productName: "Bánh Savarin Rum",
    productPrice: 55000,
    productImage:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
    productSize: 210,
    productQuantity: 44,
    productDescription:
      "Bánh savarin ngâm rum thơm nồng với kem whipped tươi mát.",
    productDiscount: 0,
    averageRating: 4.6,
    totalRatings: 16,
  },
  {
    productName: "Bánh Gâteau Nantais",
    productPrice: 58000,
    productImage:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=450",
    productSize: 250,
    productQuantity: 40,
    productDescription:
      "Bánh Gâteau Nantais với bột hạnh nhân và rum vùng Nantes.",
    productDiscount: 0,
    averageRating: 4.5,
    totalRatings: 14,
  },
  {
    productName: "Bánh Pithiviers",
    productPrice: 72000,
    productImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=480",
    productSize: 310,
    productQuantity: 32,
    productDescription:
      "Bánh Pithiviers với nhân kem hạnh nhân và puff pastry vàng óng.",
    productDiscount: 10,
    averageRating: 4.8,
    totalRatings: 21,
  },
  {
    productName: "Bánh Tropézienne",
    productPrice: 78000,
    productImage:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=480",
    productSize: 330,
    productQuantity: 28,
    productDescription:
      "Bánh Tropézienne Saint-Tropez với brioche và kem mousseline.",
    productDiscount: 8,
    averageRating: 4.9,
    totalRatings: 19,
  },
  {
    productName: "Bánh Far Breton",
    productPrice: 52000,
    productImage:
      "https://images.unsplash.com/photo-1626200032082-2be28a14aefc?w=500",
    productSize: 280,
    productQuantity: 45,
    productDescription:
      "Bánh Far Breton với mận khô và custard mềm dẻo đặc trưng.",
    productDiscount: 0,
    averageRating: 4.6,
    totalRatings: 15,
  },
  {
    productName: "Bánh Gâteau Battu",
    productPrice: 62000,
    productImage:
      "https://images.unsplash.com/photo-1612182062631-5d3e6970e876?w=500",
    productSize: 270,
    productQuantity: 36,
    productDescription:
      "Bánh Gâteau Battu Picardie cao vút với vị bơ sữa thơm ngon.",
    productDiscount: 5,
    averageRating: 4.7,
    totalRatings: 18,
  },
  {
    productName: "Bánh Galette des Rois",
    productPrice: 85000,
    productImage:
      "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=480",
    productSize: 340,
    productQuantity: 25,
    productDescription:
      "Bánh Galette des Rois truyền thống với nhân frangipane hạnh nhân.",
    productDiscount: 12,
    averageRating: 5.0,
    totalRatings: 28,
  },
  {
    productName: "Bánh Croquembouche Mini",
    productPrice: 120000,
    productImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    productSize: 400,
    productQuantity: 18,
    productDescription:
      "Tháp bánh choux mini với caramel vàng ánh và kem vani.",
    productDiscount: 15,
    averageRating: 5.0,
    totalRatings: 35,
  },
  {
    productName: "Bánh Baba Au Rhum",
    productPrice: 58000,
    productImage:
      "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=480",
    productSize: 190,
    productQuantity: 42,
    productDescription:
      "Bánh baba ngâm rum với kem chantilly và trái cây tươi.",
    productDiscount: 6,
    averageRating: 4.7,
    totalRatings: 20,
  },
  {
    productName: "Bánh Viennoiserie Mix",
    productPrice: 95000,
    productImage:
      "https://images.unsplash.com/photo-1623334044303-241021148842?w=500",
    productSize: 500,
    productQuantity: 30,
    productDescription:
      "Set bánh Pháp đa dạng: croissant, pain au chocolat, pain aux raisins.",
    productDiscount: 10,
    averageRating: 4.9,
    totalRatings: 32,
  },
  {
    productName: "Bánh Brioche Feuilletée",
    productPrice: 48000,
    productImage:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=480",
    productSize: 220,
    productQuantity: 55,
    productDescription:
      "Bánh brioche feuilletée nhiều lớp với bơ và đường craquelin.",
    productDiscount: 0,
    averageRating: 4.8,
    totalRatings: 22,
  },
  {
    productName: "Bánh Moelleux Au Chocolat",
    productPrice: 62000,
    productImage:
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
    productSize: 240,
    productQuantity: 40,
    productDescription:
      "Bánh chocolate chảy lòng với tim chocolate đen tan chảy.",
    productDiscount: 8,
    averageRating: 5.0,
    totalRatings: 30,
  },
  {
    productName: "Bánh Crème Brûlée Tart",
    productPrice: 72000,
    productImage:
      "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=450",
    productSize: 290,
    productQuantity: 34,
    productDescription:
      "Bánh tart với nhân crème brûlée và lớp đường caramel giòn.",
    productDiscount: 7,
    averageRating: 4.9,
    totalRatings: 24,
  },
  {
    productName: "Bánh Japonais Pistachio",
    productPrice: 88000,
    productImage:
      "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500",
    productSize: 310,
    productQuantity: 26,
    productDescription:
      "Bánh japonais với meringue hạnh nhân và kem bơ pistachio.",
    productDiscount: 10,
    averageRating: 4.9,
    totalRatings: 27,
  },
  {
    productName: "Bánh Gâteau Magique",
    productPrice: 68000,
    productImage:
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=500",
    productSize: 300,
    productQuantity: 35,
    productDescription:
      "Bánh ma thuật với 3 lớp khác nhau từ một hỗn hợp duy nhất.",
    productDiscount: 5,
    averageRating: 4.8,
    totalRatings: 21,
  },
  {
    productName: "Bánh Conversation",
    productPrice: 65000,
    productImage:
      "https://images.unsplash.com/photo-1587241321921-91a834d82209?w=500",
    productSize: 280,
    productQuantity: 38,
    productDescription:
      "Bánh conversation với nhân kem hạnh nhân và royal icing truyền thống.",
    productDiscount: 0,
    averageRating: 4.7,
    totalRatings: 19,
  },
  {
    productName: "Bánh Fontainebleau",
    productPrice: 58000,
    productImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=480",
    productSize: 220,
    productQuantity: 44,
    productDescription:
      "Bánh Fontainebleau nhẹ như mây với fromage blanc và kem whipped.",
    productDiscount: 0,
    averageRating: 4.6,
    totalRatings: 16,
  },
  {
    productName: "Bánh Tourteau Fromagé",
    productPrice: 52000,
    productImage:
      "https://images.unsplash.com/photo-1626200032082-2be28a14aefc?w=480",
    productSize: 260,
    productQuantity: 40,
    productDescription:
      "Bánh phô mai Poitou với vỏ đen đặc trưng và ruột kem mềm.",
    productDiscount: 0,
    averageRating: 4.5,
    totalRatings: 14,
  },
  {
    productName: "Bánh Gâteau Roulé",
    productPrice: 55000,
    productImage:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=480",
    productSize: 270,
    productQuantity: 48,
    productDescription: "Bánh cuộn mềm với nhân kem và mứt trái cây thơm ngon.",
    productDiscount: 5,
    averageRating: 4.7,
    totalRatings: 23,
  },
  {
    productName: "Bánh Passion Fruit Tart",
    productPrice: 75000,
    productImage:
      "https://images.unsplash.com/photo-1519869325930-281384150729?w=480",
    productSize: 290,
    productQuantity: 32,
    productDescription:
      "Bánh tart chanh dây chua ngọt với meringue Ý mềm mượt.",
    productDiscount: 8,
    averageRating: 4.9,
    totalRatings: 25,
  },
  {
    productName: "Bánh Ispahan",
    productPrice: 92000,
    productImage:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=450",
    productSize: 330,
    productQuantity: 24,
    productDescription:
      "Bánh Ispahan Pierre Hermé với hoa hồng, vải thiều và lychee.",
    productDiscount: 12,
    averageRating: 5.0,
    totalRatings: 33,
  },
  {
    productName: "Bánh Mont Blanc",
    productPrice: 82000,
    productImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=420",
    productSize: 270,
    productQuantity: 30,
    productDescription:
      "Bánh Mont Blanc với kem hạt dẻ, meringue giòn và kem whipped.",
    productDiscount: 9,
    averageRating: 4.8,
    totalRatings: 20,
  },
  {
    productName: "Bánh Pavlova Trái Cây",
    productPrice: 78000,
    productImage:
      "https://images.unsplash.com/photo-1519869325930-281384150729?w=450",
    productSize: 310,
    productQuantity: 33,
    productDescription:
      "Bánh Pavlova với meringue giòn bên ngoài mềm trong, trái cây tươi.",
    productDiscount: 6,
    averageRating: 4.9,
    totalRatings: 26,
  },
  {
    productName: "Bánh Schwarzwälder Kirschtorte",
    productPrice: 98000,
    productImage:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
    productSize: 360,
    productQuantity: 22,
    productDescription: "Bánh rừng đen Đức với chocolate, cherry và kem tươi.",
    productDiscount: 11,
    averageRating: 5.0,
    totalRatings: 29,
  },
];

// Hàm thêm sản phẩm
const addNewProducts = async () => {
  try {
    await connectDB();

    // Lấy tất cả category đang active
    const categories = await Category.find({ isActive: true });

    if (categories.length === 0) {
      console.error("❌ Không tìm thấy category nào đang hoạt động!");
      console.error("💡 Vui lòng tạo category trước khi thêm sản phẩm.");
      process.exit(1);
    }

    console.log(`📦 Tìm thấy ${categories.length} category đang hoạt động`);

    // Gán category cho từng sản phẩm (phân bổ đều hoặc ngẫu nhiên)
    const productsWithCategory = newProducts.map((product, index) => ({
      ...product,
      productCategory: categories[index % categories.length]._id,
    }));

    console.log(
      `\n🚀 Bắt đầu thêm ${productsWithCategory.length} sản phẩm MỚI...`
    );

    // Thêm sản phẩm vào database
    const result = await Product.insertMany(productsWithCategory);

    console.log(
      `\n✅ THÀNH CÔNG! Đã thêm ${result.length} sản phẩm mới vào database!`
    );
    console.log("\n📋 Danh sách sản phẩm đã thêm:");
    console.log("═".repeat(60));

    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(
        `   💰 Giá: ${product.productPrice.toLocaleString("vi-VN")}đ`
      );
      if (product.productDiscount > 0) {
        console.log(`   🎁 Giảm giá: ${product.productDiscount}%`);
      }
    });

    console.log("═".repeat(60));
    console.log(
      `\n💡 Tổng giá trị: ${result
        .reduce((sum, p) => sum + p.productPrice, 0)
        .toLocaleString("vi-VN")}đ`
    );
    console.log(
      `📊 Tổng số lượng: ${result.reduce(
        (sum, p) => sum + p.productQuantity,
        0
      )} sản phẩm`
    );
  } catch (error) {
    if (error.code === 11000) {
      console.error("\n❌ LỖI: Có sản phẩm bị trùng tên!");
      console.error("💡 Một số sản phẩm có thể đã tồn tại trong database.");
    } else {
      console.error("\n❌ Lỗi khi thêm sản phẩm:");
      console.error(error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Đã đóng kết nối MongoDB");
    console.log("👋 Hoàn tất!\n");
  }
};

// Chạy script
console.log("🎂 SCRIPT THÊM 50 SẢN PHẨM MỚI");
console.log("═".repeat(60));
addNewProducts();
