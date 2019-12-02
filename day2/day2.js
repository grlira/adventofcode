const fs = require("fs");

function VM(memory) {
  function decoder(opcode) {
    switch (opcode) {
      case 1:
        return (a, b) => a + b;
        break;
      case 2:
        return (a, b) => a * b;
        break;
      case 99:
        return memory[0];
        break;
      default:
        console.error(`FATAL: unrecognized opcode ${opcode}`);
        process.exit(1);
        break;
    }
  }
  let programCounter = 0;

  while (true) {
    const opcode = memory[programCounter];
    const op = decoder(opcode, memory);
    if (typeof op === "function") {
      memory[memory[programCounter + 3]] = op(
        memory[memory[programCounter + 1]],
        memory[memory[programCounter + 2]]
      );
      programCounter += 4;
    } else {
      return op; //HACK ALERT
    }
  }
}
if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const initialMemory = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

for (let noun = 0; noun <= 99; noun++) {
  for (verb = 0; verb <= 99; verb++) {
    const memory = [initialMemory[0], noun, verb, ...initialMemory.slice(3)];
    const result = VM(memory);
    if (result === 19690720) {
      console.log(`${noun}:${verb} -> ${result}`);
    }
  }
}
