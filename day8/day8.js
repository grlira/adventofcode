const fs = require("fs");

function countDigits(layer, digit) {
  return layer.reduce((count, d) => (d === digit ? count + 1 : count), 0);
}

if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
  console.error("missing input file name, width or height");
  process.exit(1);
}

const image = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("")
  .map(Number);
const width = Number(process.argv[3]);
const height = Number(process.argv[4]);
const numLayers = image.length / (width * height);

const layers = [];

for (let l = 0; l < numLayers; l++) {
  layers.push([]);
  for (let h = 0; h < height; h++) {
    layers[l].push([]);
    for (let w = 0; w < width; w++) {
      layers[l][h].push(image[l * height * width + h * width + w]);
    }
  }
}

const finalImage = [];

for (let h = 0; h < height; h++) {
  finalImage.push([]);
  for (let w = 0; w < width; w++) {
    finalImage[h].push(2);
  }
}

for (let l = 0; l < numLayers; l++) {
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      finalImage[h][w] =
        finalImage[h][w] === 2 ? layers[l][h][w] : finalImage[h][w];
    }
  }
}

for (let h = 0; h < height; h++) {
  let row = "";
  for (let w = 0; w < width; w++) {
    row = `${row}${finalImage[h][w] ? "*" : " "}`;
  }
  console.log(row);
}
