const fs = require("fs");

const STARTING_COORDINATES = {
  x: 0,
  y: 0
};

function expandInstruction(direction, distance, currentPosition) {
  let newCoordinates = [];
  for (let i = 1; i <= distance; i++) {
    let newCoordinate = {};
    switch (direction) {
      case "U":
        newCoordinate = {
          x: currentPosition.x,
          y: currentPosition.y + i
        };
        break;
      case "D":
        newCoordinate = {
          x: currentPosition.x,
          y: currentPosition.y - i
        };
        break;
      case "L":
        newCoordinate = {
          x: currentPosition.x - i,
          y: currentPosition.y
        };
        break;
      case "R":
        newCoordinate = {
          x: currentPosition.x + i,
          y: currentPosition.y
        };
        break;
    }
    newCoordinates.push(newCoordinate);
  }
  //console.log({ direction, distance, currentPosition, newCoordinates });
  return newCoordinates;
}

function lineToCoordinateList(line) {
  return line
    .split(",")
    .map(instruction => {
      const [direction, ...distanceString] = instruction;
      const distance = Number(distanceString.join(""));
      return {
        direction,
        distance
      };
    })
    .reduce(
      (visitedCoordinates, { direction, distance }) =>
        visitedCoordinates.concat(
          expandInstruction(
            direction,
            distance,
            visitedCoordinates[visitedCoordinates.length - 1] // the current position
          )
        ),
      [STARTING_COORDINATES]
    )
    .map(({ x, y }) => `${x},${y}`);
}

function intersection(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return new Set([...set1].filter(x => set2.has(x)));
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const [line1, line2] = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .map(lineToCoordinateList);

console.log("done calculating paths");

const intersected = intersection(line1, line2);

console.log("done calculating intersection");

const result = Array.from(intersected)
  .map(coordinate => line1.indexOf(coordinate) + line2.indexOf(coordinate))
  .sort((a, b) => a - b)
  .filter(Boolean);

console.log("done calculating result");

console.log(result[0]);
