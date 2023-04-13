import type { CRMProviderName } from './crm';

export type ConnectionStatus = 'available' | 'added' | 'authorized' | 'callable';

// TODO(625): Bifurcate salesforce vs hubspot
export type ConnectionCredentialsDecrypted = {
  type: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // null means unknown expiry time
  // Needed for salesforce only
  instanceUrl: string;
  loginUrl?: string;
};

type BaseConnectionCreateParams = {
  applicationId: string;
  // External customer Id
  customerId: string;
  integrationId: string;
  credentials: ConnectionCredentialsDecrypted;
  remoteId: string;
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
export type CRMConnectionUnsafe = BaseConnection & CoreCRMConnectionParams;

export type CRMConnectionUpdateParams = Pick<BaseConnectionCreateParams, 'credentials'>;

export type ConnectionCreateParams = CRMConnectionCreateParams;
export type ConnectionUpsertParams = CRMConnectionUpsertParams;
export type ConnectionUnsafe = CRMConnectionUnsafe;
export type ConnectionSafe = Omit<CRMConnectionUnsafe, 'credentials'>;
