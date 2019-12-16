const fs = require("fs");
const VM = require("./vm").default;

const readline = require("readline");

const RIGHT = "\u001b[C";
const LEFT = "\u001b[D";
const UP = "\u001b[A";

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
      return "T";
    case 4:
      return "o";
  }
}

function printScreen(screen) {
  console.log(screen.map(line => line.join("")).join("\n"));
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

function interactive() {
  const myvm = VM([...program]);

  const screen = [];
  let score = 0;
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", (key, data) => {
    if (data.sequence === UP) {
      process.exit();
    }
    if (data.sequence === RIGHT) {
      myvm.inputs.push(1);
    } else if (data.sequence === LEFT) {
      myvm.inputs.push(-1);
    } else {
      myvm.inputs.push(0);
    }
    if (myvm.run()) {
      process.exit();
    }
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
    console.clear();
    printScreen(screen);
    console.log(`Score: ${score}`);
  });
}

function automated() {
  const paddle = { x: 0, y: 0 };
  const ball = { x: 0, y: 0 };
  const myvm = VM([...program]);

  const screen = [];
  let score = 0;

  while (!myvm.run()) {
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
      if (tile === 3) {
        paddle.x = x;
        paddle.y = y;
      }
      if (tile === 4) {
        ball.x = x;
        ball.y = y;
      }
    }
    console.clear();
    printScreen(screen);
    console.log(`Score: ${score}`);
    if (paddle.x < ball.x) {
      myvm.inputs.push(1);
    } else if (paddle.x > ball.x) {
      myvm.inputs.push(-1);
    } else {
      myvm.inputs.push(0);
    }
  }
  console.log(`Final score: ${score}`);
  console.log(`Final output: ${myvm.outputs}`);
}

automated();
