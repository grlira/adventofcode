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
    for (let w = 0; w < width; w++) {
      layers[l].push(image[l * height * width + h * width + w]);
    }
  }
}

const layerWithFewest0Digits = layers
  .map((layer, i) => ({
    i,
    count: countDigits(layer, 0)
  }))
  .reduce(
    (curr, candidate) => (curr.count > candidate.count ? candidate : curr),
    { count: 99999 }
  ).i;

console.log(
  countDigits(layers[layerWithFewest0Digits], 1) *
    countDigits(layers[layerWithFewest0Digits], 2)
);
