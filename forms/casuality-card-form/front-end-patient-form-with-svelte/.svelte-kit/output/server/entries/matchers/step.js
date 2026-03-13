const match = (param) => {
  const n = parseInt(param, 10);
  return !isNaN(n) && n >= 1 && n <= 14;
};
export {
  match
};
