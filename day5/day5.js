const fs = require("fs");

const OP_ADD = 1;
const OP_MULT = 2;
const OP_INPUT = 3;
const OP_OUTPUT = 4;
const OP_JNZ = 5;
const OP_JZ = 6;
const OP_CMP = 7;
const OP_EQ = 8;
const OP_HALT = 99;

const INSTRUCTION_LENGTH = {
  [OP_ADD]: 4,
  [OP_MULT]: 4,
  [OP_INPUT]: 2,
  [OP_OUTPUT]: 2,
  [OP_JNZ]: 3,
  [OP_JZ]: 3,
  [OP_CMP]: 4,
  [OP_EQ]: 4,
  [OP_HALT]: 1
};

function fatal(message) {
  console.error(message);
  process.exit(1);
}

function VM(memory, inputs) {
  function getParam(param, memory, mode = 0) {
    switch (mode) {
      case 0:
        return memory[param];
      case 1:
        return param;
      default:
        fatal(`FATAL: unrecognized mode ${mode}`);
    }
  }

  function getInstructionCode(opcode, modes) {
    switch (opcode) {
      case OP_ADD:
        return (memory, src1, src2, dst) => {
          memory[dst] =
            getParam(src1, memory, modes[0]) + getParam(src2, memory, modes[1]);
        };

      case OP_MULT:
        return (memory, src1, src2, dst) => {
          memory[dst] =
            getParam(src1, memory, modes[0]) * getParam(src2, memory, modes[1]);
        };

      case OP_INPUT:
        return (memory, dst) => {
          const input = Number(inputs.shift());
          memory[dst] = input;
        };

      case OP_OUTPUT:
        return (memory, src) => {
          console.log(`OUTPUT ${getParam(src, memory, modes[0])}`);
        };

      case OP_JNZ:
        return (memory, src1, src2) => {
          return getParam(src1, memory, modes[0]) !== 0
            ? getParam(src2, memory, modes[1])
            : null;
        };

      case OP_JZ:
        return (memory, src1, src2) => {
          return getParam(src1, memory, modes[0]) === 0
            ? getParam(src2, memory, modes[1])
            : null;
        };

      case OP_CMP:
        return (memory, src1, src2, dst) => {
          memory[dst] =
            getParam(src1, memory, modes[0]) < getParam(src2, memory, modes[1])
              ? 1
              : 0;
        };

      case OP_EQ:
        return (memory, src1, src2, dst) => {
          memory[dst] =
            getParam(src1, memory, modes[0]) == getParam(src2, memory, modes[1])
              ? 1
              : 0;
        };

      case OP_HALT:
        return () => null;

      default:
        fatal(`FATAL: unrecognized opcode ${opcode}`);
        break;
    }
  }

  function decoder(opcode) {
    const op = opcode % 100;
    const modes = Math.floor(opcode / 100)
      .toString()
      .split("")
      .reverse()
      .map(Number);

    const instructionLength = INSTRUCTION_LENGTH[op];
    if (!instructionLength) {
      fatal(`FATAL: unrecognized opcode ${op}`);
    }

    return {
      op: getInstructionCode(op, modes),
      instructionLength
    };
  }

  let programCounter = 0;
  let halt = false;

  while (true) {
    const opcode = memory[programCounter];

    if (opcode === OP_HALT) {
      return;
    }

    const { op, instructionLength } = decoder(opcode);

    const newPc = op(
      memory,
      ...memory.slice(programCounter + 1, programCounter + instructionLength)
    );

    if (Number.isInteger(newPc)) {
      programCounter = newPc;
    } else {
      programCounter += instructionLength;
    }
  }
}

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const inputs = process.argv.slice(3);

const memory = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

const result = VM(memory, inputs);
