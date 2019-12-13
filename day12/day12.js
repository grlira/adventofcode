const fs = require("fs");

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

const gcd = (a, b) => (a ? gcd(b % a, a) : b);
const lcm = (a, b) => (a * b) / gcd(a, b);

function gravity(a, b) {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

function step(moons) {
  moons.forEach(moon => {
    moons.forEach(otherMoon => {
      if (moon == otherMoon) {
        return;
      }
      moon.vel.x += gravity(moon.pos.x, otherMoon.pos.x);
      moon.vel.y += gravity(moon.pos.y, otherMoon.pos.y);
      moon.vel.z += gravity(moon.pos.z, otherMoon.pos.z);
    });
  });
  moons.forEach(moon => {
    moon.pos.x += moon.vel.x;
    moon.pos.y += moon.vel.y;
    moon.pos.z += moon.vel.z;
  });
}

function energy({ x, y, z }) {
  return Math.abs(x) + Math.abs(y) + Math.abs(z);
}

function moonEnergy({ pos, vel }) {
  return energy(pos) * energy(vel);
}

function systemEnergy(moons) {
  return moons.map(moonEnergy).reduce((sum, moon) => sum + moon, 0);
}

function match(moons, starting, axis) {
  for (let i = 0; i < moons.length; i++) {
    if (
      moons[i].pos[axis] !== starting[i].pos[axis] ||
      moons[i].vel[axis] !== starting[i].vel[axis]
    ) {
      return false;
    }
  }
  return true;
}

const moons = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .map(line => line.substring(1, line.length - 1))
  .map(line => line.split(",").map(coord => Number(coord.trim().substr(2))))
  .map(([x, y, z]) => ({ pos: { x, y, z }, vel: { x: 0, y: 0, z: 0 } }));

const starting = [
  ...moons.map(moon => ({ pos: { ...moon.pos }, vel: { ...moon.vel } }))
];

let xPeriod = 0;
let yPeriod = 0;
let zPeriod = 0;
for (let i = 0; true; i++) {
  step(moons);
  if (!xPeriod && match(moons, starting, "x")) {
    console.log(`Found x: ${i + 1}`);
    xPeriod = i + 1;
  }
  if (!yPeriod && match(moons, starting, "y")) {
    console.log(`Found y: ${i + 1}`);
    yPeriod = i + 1;
  }
  if (!zPeriod && match(moons, starting, "z")) {
    console.log(`Found z: ${i + 1}`);
    zPeriod = i + 1;
  }
  if (xPeriod && yPeriod && zPeriod) {
    break;
  }
}

console.log(`Part 2: ${lcm(xPeriod, lcm(yPeriod, zPeriod))}`);
