type Coord = [string, ...number[]];
type Path = Coord[];

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
