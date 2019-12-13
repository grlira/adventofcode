const fs = require("fs");
const VM = require("./vm").default;

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

function getTile(tileCode) {
  switch (tileCode) {
    case 0:
      return " ";
    case 1:
      return "#";
    case 2:
      return "Q";
    case 3:
      return "_";
    case 4:
      return "o";
  }
}

function printScreen(screen) {
  screen.forEach(line => console.log(line.join("")));
}

function flatten(array) {
  return array.reduce((result, element) => [...result, ...element], []);
}

const program = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

program[0] = 2; // number of quarters inserted

const myvm = VM([...program]);
myvm.run();

const screen = [];
let score = 0;
while (myvm.outputs.length !== 0) {
  const x = myvm.outputs.shift();
  const y = myvm.outputs.shift();
  const tile = myvm.outputs.shift();

  if (x === -1 && y === 0) {
    score = tile;
    continue;
  }

  if (!screen[y]) {
    screen[y] = [];
  }
  screen[y][x] = getTile(tile);
}
printScreen(screen);

const totalBlocks = flatten(screen).reduce(
  (total, tile) => (tile === "Q" ? total + 1 : total),
  0
);

console.log(`Part 1: ${totalBlocks}`);
