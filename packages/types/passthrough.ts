export type SendPassthroughRequestRequest = {
  path: string;
  method: string;
  headers?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  body?: string | Record<string, unknown>;
};

export type SendPassthroughRequestResponse = {
  url: string;
  status: number;
  headers: Record<string, string | undefined>;
  body?: string | number | boolean | Record<string, unknown> | Record<string, unknown>[];
};
