import { CommonModelType } from './common';
import { ConnectionCreateParamsAny } from './connection';

export type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type WebhookConfig = {
  url: string;
  notifyOnSyncSuccess: boolean;
  notifyOnSyncError: boolean;
  notifyOnConnectionSuccess: boolean;
  notifyOnConnectionError: boolean;
  headers?: Record<string, string | number | boolean>; // Authorization header etc.
};

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

export type ConnectionWebhookPayload = ConnectionCreateParamsAny;

export type SyncWebhookPayload = {
  connectionId: string;
  // This should be the external customer Id
  customerId: string;
  providerName: string;
  historyId: string;
  numRecordsSynced: number;
  commonModel: CommonModelType;
  errorMessage?: string;
};

export type WebhookPayload = ConnectionWebhookPayload | SyncWebhookPayload;
