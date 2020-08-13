function logisticalMap(r: number, x: number) {
  // f(xt+1) = R * xt * (1 - xt)
  return r * x * (1 - x);
}

export {logisticalMap};
