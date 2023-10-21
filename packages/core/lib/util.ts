export const removeValues = (obj: Record<string, any>, fn: (k: string, v: any) => boolean) => {
  Object.keys(obj).forEach((key) => (fn(key, obj[key]) ? delete obj[key] : {}));
  return obj;
};

export const removeUndefinedValues = (obj: Record<string, any>): void => {
  removeValues(obj, (_, v) => v === undefined);
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

export const union = (listA: string[], listB: string[]): string[] => {
  return Array.from(new Set([...listA, ...listB]));
};

export const maxDate = (...dates: (Date | undefined | null)[]): Date => {
  const filteredDates = dates.filter((date) => date !== undefined && date !== null) as Date[];
  if (filteredDates.length === 0) {
    return new Date(0);
  }
  return new Date(Math.max(...filteredDates.map((date) => date.getTime() ?? 0)));
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}
