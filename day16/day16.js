const fs = require("fs");
const { flatten, zip, sum } = require("../utils");

const BASE_PATTERN = [0, 1, 0, -1];

function repeat(element, count) {
  return new Array(count).fill(element);
}

function pattern(position, length) {
  const repeatedBase = flatten(
    BASE_PATTERN.map(value => repeat(value, position))
  );
  const necessaryRepetitions = Math.ceil(length / repeatedBase.length);
  return flatten(repeat(repeatedBase, necessaryRepetitions + 1)).slice(
    1,
    length + 1
  );
}

const coefficientsMemo = {};
function getCoefficients(position, length) {
  if (coefficientsMemo[`${position}-${length}`]) {
    return coefficientsMemo[`${position}-${length}`];
  }
  const coefficients = pattern(position, length);
  coefficientsMemo[`${position}-${length}`] = coefficients;
  return coefficients;
}

function phase(input) {
  return repeat(input, input.length)
    .map((line, index) => {
      const coefficients = getCoefficients(index + 1, line.length);
      const effectiveLine = line.slice(index);
      const effectiveCoefficients = coefficients.slice(index);
      return zip(effectiveLine, effectiveCoefficients)
        .map(([a, b]) => a * b)
        .reduce(sum, 0);
    })
    .map(i => Math.abs(i % 10));
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const number = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("")
  .map(Number);

let temp = number;
for (let i = 0; i < 100; i++) {
  temp = phase(temp);
}
console.log(`Part 1: ${temp.slice(0, 8).join("")}`);
