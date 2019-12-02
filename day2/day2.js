const fs = require("fs");

function decoder(opcode, memory) {
  switch (opcode) {
    case 1:
      return (a, b) => a + b;
      break;
    case 2:
      return (a, b) => a * b;
      break;
    case 99:
      console.log(`Result: ${memory[0]}`);
      process.exit(0);
      break;
    default:
      console.error(`FATAL: unrecognized opcode ${opcode}`);
      process.exit(1);
      break;
  }
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

let programCounter = 0;

const memory = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

while (true) {
  const opcode = memory[programCounter];
  const op = decoder(opcode, memory);
  memory[memory[programCounter + 3]] = op(
    memory[memory[programCounter + 1]],
    memory[memory[programCounter + 2]]
  );
  programCounter += 4;
}
