const fs = require("fs");

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

function count(orbitMap, startingPoint, acc = 0) {
  if (startingPoint === "COM") {
    return acc;
  }

  return count(orbitMap, orbitMap[startingPoint], acc + 1);
}

const orbitMap = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .reduce((acc, line) => {
    const [parent, child] = line.split(")");
    return {
      ...acc,
      [child]: parent
    };
  }, {});

const part1 = Object.keys(orbitMap).reduce(
  (sum, key) => sum + count(orbitMap, key),
  0
);

console.log(`Part 1: ${distances}`);
