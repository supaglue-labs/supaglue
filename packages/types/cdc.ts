export type CDCConfig = {
  enabled: boolean;
  url: string;
  eventTypes: Record<string, string[]>; // Map of object name to list of event types
  headers?: Record<string, string>; // Authorization header etc.
};

export type CDCChangeType = 'CREATE' | 'UPDATE' | 'DELETE' | 'UNDELETE';
export type CDCWebhookPayload = {
  id: string;
  changeType: CDCChangeType;
  nulledFields: string[];
  changedFields: string[];
  diffFields: string[];
  [key: string]: unknown;
};
