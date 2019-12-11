const fs = require("fs");
function gcd(a, b) {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

function vectorToString({ x, y }) {
  return `(${x},${y})`;
}

function canSee(source, target, map) {
  const vector = {
    x: target.x - source.x,
    y: target.y - source.y
  };

  const greatestCommonDivisor = gcd(Math.abs(vector.x), Math.abs(vector.y));
  const fundamentalVector = {
    x: vector.x / greatestCommonDivisor,
    y: vector.y / greatestCommonDivisor
  };

  /*  console.log(
    `fundamental vector between ${vectorToString(source)} and ${vectorToString(
      target
    )} is ${vectorToString(fundamentalVector)} based on ${vectorToString(
      vector
    )}`
  );*/

  for (
    let x = source.x + fundamentalVector.x, y = source.y + fundamentalVector.y;
    x !== target.x || y !== target.y;
    x += fundamentalVector.x, y += fundamentalVector.y
  ) {
    /*console.log("curr", vectorToString({ x, y }));
    console.log("target", vectorToString(target));*/
    if (map[y][x]) {
      return false;
    }
  }
  return true;
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const asteroidCoordinates = [];

const asteroidMap = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .map((line, y) =>
    line.split("").map((location, x) => {
      if (location === "#") {
        asteroidCoordinates.push({ x, y });
        return true;
      }
      return false;
    })
  );

const totalVisible = asteroidCoordinates.map(source => ({
  ...source,
  totalVisible: asteroidCoordinates.reduce((total, target) => {
    if (source === target || !canSee(source, target, asteroidMap)) {
      return total;
    }

    return total + 1;
  }, 0)
}));

console.log(
  "Part 1: ",
  Math.max(...totalVisible.map(({ totalVisible }) => totalVisible))
);
