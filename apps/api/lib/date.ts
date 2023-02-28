export function stringOrNullOrUndefinedToDate(input: string | null | undefined): Date | null | undefined {
  return typeof input === 'string' ? new Date(input) : input;
}
