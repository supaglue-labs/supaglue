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

export const maxDate = (...dates: (Date | undefined | null)[]): Date => {
  const filteredDates = dates.filter((date) => date !== undefined && date !== null) as Date[];
  if (filteredDates.length === 0) {
    return new Date(0);
  }
  return new Date(Math.max(...filteredDates.map((date) => date.getTime() ?? 0)));
};
