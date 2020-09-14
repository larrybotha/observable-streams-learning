export function buildPath(xxs: [string, ...number[]][]) {
  return xxs.reduce((acc, [command, ...xs]) => {
    const coordString = xs.join(' ');
    const result = `${acc}\n${command} ${coordString}`;

    return result;
  }, '');
}
