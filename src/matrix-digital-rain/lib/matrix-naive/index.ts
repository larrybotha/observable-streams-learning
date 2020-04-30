import { Matrix, MatrixItem } from "./interfaces";

const createLine = (x: number, y: number): MatrixItem => ({
  x,
  y,
  chars: [],
  remove: false,
});
const random = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
};
const randomChar = () => String.fromCharCode(random(128));

const markForRemoval = (matrix: Matrix) =>
  matrix.forEach(item => {
    item.remove = item.remove || item.chars.length > 20;
  });
const updateLines = (matrix: Matrix) =>
  matrix.forEach(
    item =>
      (item.chars = item.remove
        ? item.chars.slice(1).map(_ => randomChar())
        : [randomChar(), ...item.chars.map(_ => randomChar())])
  );
const updateMatrix = (matrix: Matrix) => [
  ...matrix,
  createLine(random(window.innerWidth), random(window.innerHeight) / 4),
];

export { markForRemoval, updateLines, updateMatrix };
