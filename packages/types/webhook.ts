import { CommonModel } from './common';
import { ConnectionCreateParams } from './connection';

export type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type WebhookConfig = {
  url: string;
  requestType: HttpRequestType; // GET, POST, etc.
  notifyOnSyncSuccess: boolean;
  notifyOnSyncError: boolean;
  notifyOnConnectionSuccess: boolean;
  notifyOnConnectionError: boolean;
  headers?: Record<string, string | number | boolean>; // Authorization header etc.
};

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

export type ConnectionWebhookPayload = ConnectionCreateParams;

export type SyncWebhookPayload = {
  connectionId: string;
  // This should be the external customer Id
  customerId: string;
  providerName: string;
  historyId: string;
  numRecordsSynced: number;
  commonModel: CommonModel;
  errorMessage?: string;
};

export type WebhookPayload = ConnectionWebhookPayload | SyncWebhookPayload;
