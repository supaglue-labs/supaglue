export const fetcher = <T>(input: RequestInfo, init: RequestInit): Promise<T> => {
  return fetch(input, init).then<T>((res) => res.json());
};
