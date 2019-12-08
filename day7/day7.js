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

const phaseSpace = permutations([0, 1, 2, 3, 4]);

const INPUT_A = 0;

const program = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

const outputs = phaseSpace.map(phases => {
  const resultA = VM([...program], [phases[0], INPUT_A])[0];
  const resultB = VM([...program], [phases[1], resultA])[0];
  const resultC = VM([...program], [phases[2], resultB])[0];
  const resultD = VM([...program], [phases[3], resultC])[0];
  const resultE = VM([...program], [phases[4], resultD])[0];
  return resultE;
});

console.log(Math.max(...outputs));
