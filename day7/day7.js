const fs = require("fs");
const VM = require("./vm").default;

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

function permutations(digits) {
  if (digits.length === 1) {
    return [digits];
  }

  const results = [];

  for (let i = 0; i < digits.length; i++) {
    const restDigits = [
      ...digits.slice(0, i),
      ...digits.slice(i + 1, digits.length + 1)
    ];

    const permutationsRest = permutations(restDigits);

    for (let p = 0; p < permutationsRest.length; p++) {
      results.push([digits[i], ...permutationsRest[p]]);
    }
  }
  return results;
}

const phaseSpace = permutations([5, 6, 7, 8, 9]);

const INPUT_A = 0;

const program = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

const outputs = permutations([5, 6, 7, 8, 9]).map(phases => {
  const inputs = [
    [phases[0], 0],
    [phases[1]],
    [phases[2]],
    [phases[3]],
    [phases[4]]
  ];
  const outputs = [[], [], [], [], []];
  const VMS = [];
  for (let i = 0; i < 5; i++) {
    VMS.push(VM([...program], inputs[i], outputs[i]));
  }
  let i = 0;
  while (true) {
    const currentVM = i % 5;
    const nextVM = (i + 1) % 5;
    if (VMS[currentVM].run() && i % 5 === 4) {
      return outputs[currentVM][outputs[currentVM].length - 1];
    }
    inputs[nextVM].push(outputs[currentVM][outputs[currentVM].length - 1]);
    i++;
  }
});

console.log(Math.max(...outputs));
