export const removeUndefinedValues = (obj: Record<string, any>): void => {
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
};
