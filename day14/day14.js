const fs = require("fs");

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

function parseChemical(chemical) {
  const [quantity, symbol] = chemical.split(" ");
  return {
    quantity: Number(quantity),
    symbol
  };
}

function resolveTarget(symbol, quantity, reactions) {
  const reaction = reactions[symbol];
  if (!reaction) {
    console.error(`Nothing produces ${symbol}`);
  }

  const multiplier = Math.ceil(quantity / reaction.quantity);
  const actuallyProduced = reaction.quantity * multiplier;

  const targetsForTarget = reaction.reagents
    .map(reagent => ({
      symbol: reagent.symbol,
      quantity: reagent.quantity * multiplier
    }))
    .reduce(
      (acc, target) => ({
        ...acc,
        [target.symbol]: target.quantity + (acc[target.symbol] || 0)
      }),
      {}
    );

  return {
    targetsForTarget,
    waste: actuallyProduced - quantity
  };
}

function resolveTargets({ targets, runningWaste }, reactions) {
  return Object.keys(targets).reduce(
    ({ result, runningWaste }, target) => {
      if (target === "ORE") {
        return {
          result: {
            ...result,
            ORE: targets.ORE + (result.ORE || 0)
          },
          runningWaste
        };
      }
      const canUseFromWaste = runningWaste[target] || 0;
      const { targetsForTarget, waste } = resolveTarget(
        target,
        targets[target] - canUseFromWaste,
        reactions
      );

      return {
        runningWaste: {
          ...runningWaste,
          [target]: waste
        },
        result: Object.keys(targetsForTarget).reduce(
          (acc, target) => ({
            ...acc,
            [target]: targetsForTarget[target] + (acc[target] || 0)
          }),
          result
        )
      };
    },
    { result: {}, runningWaste }
  );
}

const reactions = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .map(line => {
    const [reagentList, products] = line.split(" => ");
    const reagents = reagentList.split(", ").map(parseChemical);
    const product = parseChemical(products);
    return { reagents, product };
  })
  .reduce(
    (acc, { reagents, product }) => ({
      ...acc,
      [product.symbol]: {
        quantity: product.quantity,
        reagents
      }
    }),
    {}
  );

function getOreRequirement(fuelQuantity) {
  let required = {
    FUEL: fuelQuantity
  };
  let accumulatedWaste = {};
  while (!(required.ORE && Object.keys(required).length === 1)) {
    const { result, runningWaste } = resolveTargets(
      { targets: required, runningWaste: accumulatedWaste },
      reactions
    );
    required = result;
    accumulatedWaste = runningWaste;
  }
  return required.ORE;
}

console.log(`Part 1: ${getOreRequirement(1)}`);

function binary(lower, upper) {
  while (upper - lower > 1) {
    const mid = lower + Math.round((upper - lower) / 2);
    const oreRequirement = getOreRequirement(mid);
    if (oreRequirement < 1000000000000) {
      lower = mid;
    } else {
      upper = mid;
    }
  }
  console.log(`Part 2: ${lower}`);
}

let fuel = 1;
let preFuel = 1;
while (true) {
  const oreRequirement = getOreRequirement(fuel);
  if (oreRequirement < 1000000000000) {
    prevFuel = fuel;
    fuel *= 2;
  } else {
    binary(prevFuel, fuel);
    break;
  }
}
