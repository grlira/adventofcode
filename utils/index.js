function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function flatten(arr) {
  return Array.isArray(arr)
    ? arr.reduce((acc, elem) => [...acc, ...flatten(elem)], [])
    : [arr];
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
