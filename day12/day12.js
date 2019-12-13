const fs = require("fs");

if (!process.argv[2]) {
  console.error("missing input file name");
  process.exit(1);
}

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

const moons = fs
  .readFileSync(process.argv[2])
  .toString()
  .split("\n")
  .map(line => line.substring(1, line.length - 1))
  .map(line => line.split(",").map(coord => Number(coord.trim().substr(2))))
  .map(([x, y, z]) => ({ pos: { x, y, z }, vel: { x: 0, y: 0, z: 0 } }));

for (let i = 0; i < 1000; i++) {
  step(moons);
}
console.log(`Part 1: ${systemEnergy(moons)}`);
