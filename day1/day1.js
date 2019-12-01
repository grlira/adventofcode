const fs = require("fs");

const lines = fs.readFileSync("input.txt");
console.log(
  lines
    .toString()
    .split("\n")
    .map(line => Math.floor(parseInt(line, 10) / 3) - 2)
    .reduce((total, fuel) => total + fuel, 0)
);
