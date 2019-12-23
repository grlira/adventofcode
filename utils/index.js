function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function flatten(arr) {
  const acc = [];
  const queue = [arr];
  while (queue.length !== 0) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      queue.unshift(...item);
      continue;
    }
    acc.push(item);
  }
  return acc;
}

function zip(arr1, arr2) {
  return arr1.map((e, i) => [e, arr2[i]]);
}

function sum(a, b) {
  return a + b;
}

module.exports = {
  clone,
  flatten,
  zip,
  sum
};
