const fs = require("fs");
const VM = require("./vm").default;

const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

const newDirections = {
  0: {
    [UP]: LEFT,
    [DOWN]: RIGHT,
    [LEFT]: DOWN,
    [RIGHT]: UP
  },
  1: {
    [UP]: RIGHT,
    [DOWN]: LEFT,
    [LEFT]: UP,
    [RIGHT]: DOWN
  }
};

const DX = {
  [UP]: 0,
  [DOWN]: 0,
  [LEFT]: -1,
  [RIGHT]: 1
};

const DY = {
  [UP]: -1,
  [DOWN]: 1,
  [LEFT]: 0,
  [RIGHT]: 0
};

function make2d(sizeX, sizeY, value) {
  return new Array(sizeY).fill(null).map(() => new Array(sizeX).fill(value));
}

function getColor(map, x, y) {
  if (map && map[y] && map[y][x]) {
    return map[y][x];
  }
  return 0;
}

function setColor(map, x, y, color) {
  if (!map[y]) {
    map[y] = {};
  }
  map[y][x] = color;
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const program = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

const map = {
  0: {
    0: 1
  }
};
const coords = {
  x: 0,
  y: 0
};
let direction = UP;
const painted = new Set();

const myvm = VM([...program]);
myvm.inputs.push(getColor(map, coords.x, coords.y));
while (!myvm.run()) {
  const color = myvm.outputs.shift();
  const turn = myvm.outputs.shift();
  direction = newDirections[turn][direction];

  setColor(map, coords.x, coords.y, color);
  const coordsAsString = `${coords.x},${coords.y}`;
  if (color && !painted.has(coordsAsString)) {
    painted.add(coordsAsString);
  }

  coords.x += DX[direction];
  coords.y += DY[direction];
  myvm.inputs.push(getColor(map, coords.x, coords.y));
}

const output = make2d(43, 6, " ");
for (let y = 0; y < 6; y++) {
  for (let x = 0; x < 43; x++) {
    output[y][x] = getColor(map, x, y) ? "#" : " ";
  }
}

for (let y = 0; y < 6; y++) {
  console.log(output[y].join(""));
}
