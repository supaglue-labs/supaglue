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

export function millisToHumanReadable(millis: number): string {
  const seconds = Math.floor((millis / 1000) % 60);
  const minutes = Math.floor((millis / (1000 * 60)) % 60);
  const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
  const days = Math.floor(millis / (1000 * 60 * 60 * 24));

  let humanReadable = '';

  // Add days if any
  if (days > 0) {
    humanReadable += `${days} day${days > 1 ? 's' : ''}, `;
  }

  // Add hours if any
  if (hours > 0) {
    humanReadable += `${hours} hour${hours > 1 ? 's' : ''}, `;
  }

  // Add minutes if any
  if (minutes > 0) {
    humanReadable += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  }

  // Add seconds
  if (seconds > 0) {
    humanReadable += `${seconds} second${seconds > 1 || seconds === 0 ? 's' : ''}`;
  }

  if (humanReadable.endsWith(', ')) {
    humanReadable = humanReadable.slice(0, -2);
  }

  return humanReadable;
}
