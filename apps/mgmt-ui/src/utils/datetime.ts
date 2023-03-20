import { DateTime } from 'luxon';

export const datetimeFromISOString = (timestamp: string, local = true): DateTime => {
  const dateTime = DateTime.fromISO(timestamp, {
    zone: 'UTC',
  });
  return local ? dateTime.toLocal() : dateTime;
};

export const datetimeStringFromISOString = (timestamp: string): string => {
  return datetimeFromISOString(timestamp).toFormat('yyyy-LL-dd hh:mma');
};

// Return a human-readable description of a timestamp.
// If the timestamp is less than 1 minute ago, return "just now."
export const relativeDateFromISOString = (timestamp?: string | null): string => {
  if (!timestamp) {
    return '-';
  }
  const description = datetimeFromISOString(timestamp).toRelative();
  if (DateTime.fromISO(timestamp) > DateTime.now().minus({ minute: 1 })) {
    return 'just now';
  }
  return description || '-';
};
