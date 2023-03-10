import type { CRMProviderName } from './crm';

export type ConnectionStatus = 'available' | 'added' | 'authorized' | 'callable';

export type ConnectionCredentials = {
  type: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // null means unknown expiry time
  instanceUrl: string;
};

type BaseConnectionCreateParams = {
  customerId: string;
  integrationId: string;
  credentials: ConnectionCredentials;
};

type BaseConnection = BaseConnectionCreateParams & {
  id: string;
  status: ConnectionStatus;
};

type CoreCRMConnectionParams = {
  category: 'crm';
  providerName: CRMProviderName;
};

export type CRMConnectionCreateParams = BaseConnectionCreateParams & CoreCRMConnectionParams;
export type CRMConnectionUpsertParams = BaseConnectionCreateParams & CoreCRMConnectionParams;
export type CRMConnection = BaseConnection & CoreCRMConnectionParams;

export type CRMConnectionUpdateParams = Pick<BaseConnectionCreateParams, 'credentials'>;

export type ConnectionCreateParams = CRMConnectionCreateParams;
export type ConnectionUpsertParams = CRMConnectionUpsertParams;
export type Connection = CRMConnection;
