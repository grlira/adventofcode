const { clone } = require("../utils");

const OP_ADD = 1;
const OP_MULT = 2;
const OP_INPUT = 3;
const OP_OUTPUT = 4;
const OP_JNZ = 5;
const OP_JZ = 6;
const OP_CMP = 7;
const OP_EQ = 8;
const OP_MRB = 9;
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
  [OP_MRB]: 2,
  [OP_HALT]: 1
};

const MODE_POSITION = 0;
const MODE_IMMEDIATE = 1;
const MODE_RELATIVE = 2;

function fatal(message) {
  console.error(message);
  process.exit(1);
}

function getParam(relativeBase, param, memory, mode = MODE_POSITION) {
  switch (mode) {
    case MODE_POSITION:
      return memory[param] || 0;
    case MODE_IMMEDIATE:
      return param;
    case MODE_RELATIVE:
      return memory[relativeBase + param] || 0;
    default:
      fatal(`FATAL: unrecognized mode ${mode}`);
  }
}

function set(relativeBase, memory, address, value, mode = MODE_POSITION) {
  switch (mode) {
    case MODE_POSITION:
      memory[address] = value;
      break;
    case MODE_RELATIVE:
      memory[address + relativeBase] = value;
      break;
    default:
      fatal(`FATAL: unrecognized mode ${mode}`);
  }
}

function getInstructionCode(opcode, modes, VM) {
  const { inputs, outputs, memory, relativeBase } = VM;
  switch (opcode) {
    case OP_ADD:
      return (memory, src1, src2, dst) => {
        set(
          relativeBase,
          memory,
          dst,
          getParam(relativeBase, src1, memory, modes[0]) +
            getParam(relativeBase, src2, memory, modes[1]),
          modes[2]
        );
      };

    case OP_MULT:
      return (memory, src1, src2, dst) => {
        set(
          relativeBase,
          memory,
          dst,
          getParam(relativeBase, src1, memory, modes[0]) *
            getParam(relativeBase, src2, memory, modes[1]),
          modes[2]
        );
      };

    case OP_INPUT:
      return (memory, dst) => {
        if (inputs.length === 0) {
          VM.shouldSuspend = true;
          return;
        }
        const input = Number(inputs.shift());
        set(relativeBase, memory, dst, input, modes[0]);
      };

    case OP_OUTPUT:
      return (memory, src) => {
        const output = getParam(relativeBase, src, memory, modes[0]);
        outputs.push(output);
      };

    case OP_JNZ:
      return (memory, src1, src2) => {
        return getParam(relativeBase, src1, memory, modes[0]) !== 0
          ? getParam(relativeBase, src2, memory, modes[1])
          : null;
      };

    case OP_JZ:
      return (memory, src1, src2) => {
        return getParam(relativeBase, src1, memory, modes[0]) === 0
          ? getParam(relativeBase, src2, memory, modes[1])
          : null;
      };

    case OP_CMP:
      return (memory, src1, src2, dst) => {
        const result =
          getParam(relativeBase, src1, memory, modes[0]) <
          getParam(relativeBase, src2, memory, modes[1])
            ? 1
            : 0;
        set(relativeBase, memory, dst, result, modes[2]);
      };

    case OP_EQ:
      return (memory, src1, src2, dst) => {
        const result =
          getParam(relativeBase, src1, memory, modes[0]) ==
          getParam(relativeBase, src2, memory, modes[1])
            ? 1
            : 0;
        set(relativeBase, memory, dst, result, modes[2]);
      };

    case OP_MRB:
      return (memory, src) => {
        VM.relativeBase += getParam(relativeBase, src, memory, modes[0]);
      };

    case OP_HALT:
      return () => null;

    default:
      fatal(`FATAL: unrecognized opcode ${opcode}`);
      break;
  }
}

function decoder(opcode, VM) {
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
    op: getInstructionCode(op, modes, VM),
    instructionLength
  };
}

function make(memory) {
  return {
    inputs: [],
    outputs: [],
    memory,
    programCounter: 0,
    shouldSuspend: false,
    relativeBase: 0
  };
}

function run(VM) {
  const { programCounter } = VM;
  VM.shouldSuspend = false;
  while (true) {
    const opcode = VM.memory[VM.programCounter];

    if (opcode === OP_HALT) {
      return true;
    }

    const { op, instructionLength } = decoder(opcode, VM);

    const newPc = op(
      VM.memory,
      ...VM.memory.slice(
        VM.programCounter + 1,
        VM.programCounter + instructionLength
      )
    );

    if (VM.shouldSuspend) {
      return false;
    }

    if (Number.isInteger(newPc)) {
      VM.programCounter = newPc;
    } else {
      VM.programCounter += instructionLength;
    }
  }
}

function copy(oldVM) {
  const newVM = make(clone(oldVM.memory));
  newVM.inputs = clone(oldVM.inputs);
  newVM.outputs = clone(oldVM.outputs);
  newVM.programCounter = clone(oldVM.programCounter);
  newVM.shouldSuspend = clone(oldVM.shouldSuspend);
  newVM.relativeBase = clone(oldVM.relativeBase);
  return newVM;
}

module.exports = {
  make,
  copy,
  run
};
