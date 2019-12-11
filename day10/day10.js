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

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

function polarToString({ r, theta, theta0 }) {
  return `(r:${r}, theta:${theta})`;
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

  for (
    let x = source.x + fundamentalVector.x, y = source.y + fundamentalVector.y;
    x !== target.x || y !== target.y;
    x += fundamentalVector.x, y += fundamentalVector.y
  ) {
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

const best = totalVisible.reduce(
  (best, candidate) =>
    candidate.totalVisible > best.totalVisible ? candidate : best,
  totalVisible[0]
);

console.log(best);

// make best the center
const translated = asteroidCoordinates.map(({ x, y }) => ({
  x: x - best.x,
  y: y - best.y
}));

console.log("translated", translated);

const polar = translated
  .filter(({ x, y }) => x !== 0 || y !== 0) // get rid of best
  .map(({ x, y }) => {
    return {
      r: Math.sqrt(x * x + y * y),
      theta: (radToDeg(Math.atan2(y, x)) - 90 + 180 + 360) % 360,
      x: x + best.x,
      y: y + best.y
    };
  })
  .sort((a, b) => {
    if (a.theta < b.theta) {
      return -1;
    }
    if (a.theta > b.theta) {
      return 1;
    }

    if (a.r < b.r) {
      return -1;
    }
    if (a.r > b.r) {
      return 1;
    }

    return 0;
  });

polar.forEach(coords => {
  console.log(`${vectorToString(coords)} -> ${polarToString(coords)}`);
});

let count = 1;
let currTheta = null;
while (count <= 200 && polar.length > 1) {
  const target = polar.shift();
  if (target.theta === currTheta) {
    polar.push(target);
    continue;
  }
  console.log(`${count}: zapping at ${vectorToString(target)}`);
  currTheta = target.theta;
  count++;
}
