export const removeUndefinedValues = (obj: Record<string, any>): void => {
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
};

export const intersection = (listA: string[], listB: string[]): string[] => {
  const setB: Set<string> = new Set(listB);

  const result: string[] = [];

  listA.forEach((value: string) => {
    if (setB.has(value)) {
      result.push(value);
    }
  });

  return result;
};
