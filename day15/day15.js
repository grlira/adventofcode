const fs = require("fs");
const { make, copy, run } = require("./vm");

const DX = {
  1: 0,
  2: 0,
  3: -1,
  4: 1
};
const DY = {
  1: -1,
  2: 1,
  3: 0,
  4: 0
};

function v(coords) {
  return `(${coords.x},${coords.y})`;
}

function set(map, coords, value) {
  if (!map[coords.y]) {
    map[coords.y] = {};
  }
  map[coords.y][coords.x] = value;
}

function get(map, coords) {
  return (map[coords.y] && map[coords.y][coords.x]) || " ";
}

function getOffsets(map) {
  const yMin = Math.min(...Object.keys(map));
  const xMin = Math.min(
    ...Object.keys(map).reduce(
      (acc, row) => [...acc, Math.min(...Object.keys(map[row]))],
      []
    )
  );

  const yMax = Math.max(...Object.keys(map));
  const xMax = Math.max(
    ...Object.keys(map).reduce(
      (acc, row) => [...acc, Math.max(...Object.keys(map[row]))],
      []
    )
  );
  return {
    min: {
      x: xMin,
      y: yMin
    },
    max: {
      x: xMax,
      y: yMax
    }
  };
}

function make2d(sizeX, sizeY, value) {
  return new Array(sizeY).fill(null).map(() => new Array(sizeX).fill(value));
}

function print(map) {
  const offsets = getOffsets(map);
  const lenX = offsets.max.x - offsets.min.x + 1;
  const lenY = offsets.max.y - offsets.min.y + 1;
  const arrayMap = make2d(lenX, lenY, " ");
  for (let y = offsets.min.y; y < offsets.max.y + 1; y++) {
    for (let x = offsets.min.x; x < offsets.max.x + 1; x++) {
      arrayMap[y - offsets.min.y][x - offsets.min.x] = get(map, { x, y });
    }
  }
  console.log(arrayMap.map(row => row.join("")).join("\n"));
  console.log("\n\n");
}

function expand({ x, y }, visited, map) {
  return [1, 2, 3, 4]
    .map(direction => ({
      direction,
      x: x + DX[direction],
      y: y + DY[direction]
    }))
    .filter(newCoords => !visited.has(`${v(newCoords)}`))
    .filter(newCoords => get(map, newCoords) !== "#")
    .map(({ direction }) => direction);
}

function updateMap(coords, direction, map, status) {
  switch (status) {
    case 0:
      const wallCoords = {
        x: coords.x + DX[direction],
        y: coords.y + DY[direction]
      };
      set(map, wallCoords, "#");
      break;
    case 1:
      set(map, coords, ".");
      break;
    case 2:
      set(map, coords, ".");
      const oxygenCoords = {
        x: coords.x + DX[direction],
        y: coords.y + DY[direction]
      };
      set(map, oxygenCoords, "O");
      break;
  }
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

const STARTING_COORDS = { x: 0, y: 0 };

const map = {};
set(map, STARTING_COORDS, " ");

const oxygenCoordinates = (function() {
  const oxygenCoordinates = {};
  const visited = new Set([v(STARTING_COORDS)]);
  const vm = make(program);

  const queue = [];
  queue.push(
    ...expand(STARTING_COORDS, visited, map).map(nextDirection => ({
      nextDirection,
      baseVM: vm,
      sourceCoords: STARTING_COORDS,
      dist: 0
    }))
  );

  while (queue.length !== 0) {
    const { nextDirection, baseVM, sourceCoords, dist } = queue.shift();

    const newVM = copy(baseVM);
    newVM.inputs.push(nextDirection);
    run(newVM);

    const status = newVM.outputs.shift();
    updateMap(sourceCoords, nextDirection, map, status);

    if (status === 1 || status === 2) {
      const newCoords = {
        x: sourceCoords.x + DX[nextDirection],
        y: sourceCoords.y + DY[nextDirection]
      };
      visited.add(`${v(newCoords)}`);
      const newDirections = expand(newCoords, visited, map);

      queue.push(
        ...newDirections.map(nextDirection => ({
          nextDirection,
          sourceCoords: newCoords,
          baseVM: newVM,
          dist: dist + 1
        }))
      );

      if (status === 2) {
        console.log(`Part 1: ${dist + 1}`);
        oxygenCoordinates.x = newCoords.x;
        oxygenCoordinates.y = newCoords.y;
      }
    }
  }
  print(map);
  return oxygenCoordinates;
})();
