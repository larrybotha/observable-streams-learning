type Coord = [string, ...number[]];
type Path = Coord[];

// https://stackoverflow.com/a/17546429/895007
function solveQuadraticEquation(a, b, c) {
  var discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return [];
  } else {
    return [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)];
  }
}

function solveCubicEquation(a, b, c, d) {
  if (!a) return solveQuadraticEquation(b, c, d);

  b /= a;
  c /= a;
  d /= a;

  var p = (3 * c - b * b) / 3;
  var q = (2 * b * b * b - 9 * b * c + 27 * d) / 27;

  if (p === 0) {
    return [Math.pow(-q, 1 / 3)];
  } else if (q === 0) {
    return [Math.sqrt(-p), -Math.sqrt(-p)];
  } else {
    var discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);

    if (discriminant === 0) {
      return [Math.pow(q / 2, 1 / 3) - b / 3];
    } else if (discriminant > 0) {
      return [
        Math.pow(-(q / 2) + Math.sqrt(discriminant), 1 / 3) -
          Math.pow(q / 2 + Math.sqrt(discriminant), 1 / 3) -
          b / 3,
      ];
    } else {
      var r = Math.sqrt(Math.pow(-(p / 3), 3));
      var phi = Math.acos(-(q / (2 * Math.sqrt(Math.pow(-(p / 3), 3)))));

      var s = 2 * Math.pow(r, 1 / 3);

      return [
        s * Math.cos(phi / 3) - b / 3,
        s * Math.cos((phi + 2 * Math.PI) / 3) - b / 3,
        s * Math.cos((phi + 4 * Math.PI) / 3) - b / 3,
      ];
    }
  }
}

function roundToDecimal(num, dec) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

function solveCubicBezier(p0, p1, p2, p3, x) {
  p0 -= x;
  p1 -= x;
  p2 -= x;
  p3 -= x;

  const a = p3 - 3 * p2 + 3 * p1 - p0;
  const b = 3 * p2 - 6 * p1 + 3 * p0;
  const c = 3 * p1 - 3 * p0;
  const d = p0;

  const roots = solveCubicEquation(a, b, c, d);
  const result = [];
  let root: number;

  for (let i = 0; i < roots.length; i++) {
    root = roundToDecimal(roots[i], 15);
    if (root >= 0 && root <= 1) result.push(root);
  }

  return result;
}

export function buildPath(xxs: Path) {
  return xxs.reduce((acc, [command, ...xs]) => {
    const coordString = xs.join(' ');
    const result = `${acc}\n${command} ${coordString}`;

    return result;
  }, '');
}

export function mapPathToPath(path1: Path, path2: Path) {
  const result = [path1, path2]
    .reduce((acc, xxs, i) => {
      const pathCoords = i > 0 ? xxs.slice(1) : xxs;
      const newCoords =
        i > 0
          ? pathCoords.map((coords) =>
              coords.map((coord, i) => {
                const command = i === 0 ? 'C' : undefined;
                const value = i === coords.length - 2 ? coord : 0;

                return command || value;
              }),
            )
          : pathCoords;

      return [...acc, ...newCoords];
    }, [])
    // sort by x
    .sort((as, bs) => {
      const ax = as.slice(-2)[0];
      const bx = bs.slice(-2)[0];

      return ax > bx ? 1 : -1;
    })
    .map((xs, i, xxs) => {
      return xs;
    });

  debugger;
  return result;
}
