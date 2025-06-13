const generatePuzzle = (name) => {
  const chars = name.split("");
  const hideCount = Math.floor(chars.length / 2); // Che ~nửa số kí tự
  let hiddenIndices = [];
  while (hiddenIndices.length < hideCount) {
    const index = Math.floor(Math.random() * chars.length);
    if (!hiddenIndices.includes(index)) hiddenIndices.push(index);
  }
  const puzzle = chars
    .map((char, i) => (hiddenIndices.includes(i) ? "_" : char))
    .join("");
  return { puzzle, answer: name };
};

module.exports = { generatePuzzle };
