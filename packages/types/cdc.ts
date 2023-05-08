export type CDCWebhookPayload = {
  id: string;
  nulledFields: string[];
  changedFields: string[];
  diffFields: string[];
  fields: Record<string, unknown>;
};
