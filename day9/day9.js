const fs = require("fs");
const VM = require("./vm").default;

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const program = fs
  .readFileSync(process.argv[2])
  .toString()
  .split(",")
  .map(input => parseInt(input, 10));

const myvm = VM([...program], [2]);
myvm.run();
console.log(myvm.outputs);
