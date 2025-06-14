// Hàm loại bỏ dấu tiếng Việt
const removeVietnameseAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getHintChars(missingChars, total = 10) {
  let hints = Array.from(new Set(missingChars)); // loại trùng
  while (hints.length < total) {
    const randChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (!hints.includes(randChar)) hints.push(randChar);
  }
  // Trộn mảng
  for (let i = hints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hints[i], hints[j]] = [hints[j], hints[i]];
  }
  return hints;
}

// Hàm tạo ô chữ từ tên sản phẩm
const generatePuzzle = (productName) => {
  // Loại bỏ dấu và chuyển thành chữ hoa
  const cleanName = removeVietnameseAccents(productName).toUpperCase();
  const chars = cleanName.split("");

  // Tính số ký tự sẽ ẩn (khoảng 60-70% số ký tự)
  const hideCount = Math.max(2, Math.floor(chars.length * 0.6));

  // Tạo mảng các vị trí sẽ ẩn
  let hiddenIndices = [];
  while (hiddenIndices.length < hideCount) {
    const index = Math.floor(Math.random() * chars.length);
    if (!hiddenIndices.includes(index) && chars[index] !== " ") {
      hiddenIndices.push(index);
    }
  }

  // Tạo ô chữ
  const puzzle = chars
    .map((char, i) => {
      if (char === " ") return " "; // Giữ nguyên khoảng trắng
      return hiddenIndices.includes(i) ? "_" : char;
    })
    .join("");

  // Tạo mảng các ký tự cần điền (để làm gợi ý)
  const missingChars = hiddenIndices.map((index) => chars[index]);

  // Tạo mảng gợi ý gồm ký tự đúng và ký tự nhiễu
  const hintChars = getHintChars(
    missingChars,
    Math.max(8, missingChars.length + 4)
  );

  return {
    puzzle,
    answer: cleanName,
    originalName: productName, // Lưu tên gốc để hiển thị
    hiddenIndices, // Vị trí các ô trống
    missingChars, // Các ký tự cần điền
    hintChars, // Mảng gợi ý ký tự
    totalLength: cleanName.length,
  };
};

module.exports = { generatePuzzle, removeVietnameseAccents };
