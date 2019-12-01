const fs = require("fs");

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const lines = fs.readFileSync(process.argv[2]);

function fuelCost(mass) {
  const fuel = Math.max(Math.floor(mass / 3) - 2, 0);
  return fuel > 0 ? fuel + fuelCost(fuel) : fuel;
}

console.log(
  lines
    .toString()
    .split("\n")
    .map(line => fuelCost(parseInt(line, 10)))
    .reduce((total, fuel) => total + fuel, 0)
);
