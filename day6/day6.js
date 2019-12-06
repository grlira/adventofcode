const fs = require("fs");

function intersection(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return new Set([...set1].filter(x => set2.has(x)));
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

function count(orbitMap, startingPoint, acc = 0, destination) {
  if (
    startingPoint === "COM" ||
    (destination && startingPoint === destination)
  ) {
    return acc;
  }

  return count(orbitMap, orbitMap[startingPoint], acc + 1, destination);
}

function findPath(orbitMap, startingPoint) {
  if (startingPoint === "COM") {
    return ["COM"];
  }

  return [startingPoint, ...findPath(orbitMap, orbitMap[startingPoint])];
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

console.log(`Part 1: ${part1}`);

const YOUPath = findPath(orbitMap, "YOU");
const SANPath = findPath(orbitMap, "SAN");

const common = intersection(YOUPath, SANPath);

const firstCommonBody = Array.from(common)[0];

const YOUHops = count(orbitMap, orbitMap["YOU"], 0, firstCommonBody);
const SANHops = count(orbitMap, orbitMap["SAN"], 0, firstCommonBody);
console.log(`Part 2: ${YOUHops + SANHops}`);
