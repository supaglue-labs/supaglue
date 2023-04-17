import type { CRMProviderName } from './crm';

export type ConnectionStatus = 'available' | 'added' | 'authorized' | 'callable';

type BaseConnectionCredentialsDecrypted = {
  type: 'oauth2';
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // null means unknown expiry time
};

export type ConnectionCredentialsDecrypted<T extends CRMProviderName> = BaseConnectionCredentialsDecrypted &
  (T extends 'salesforce'
    ? {
        instanceUrl: string;
        loginUrl?: string;
      }
    : object);

export type ConnectionCredentialsDecryptedAny = {
  [K in CRMProviderName]: ConnectionCredentialsDecrypted<K>;
}[CRMProviderName];

export type ConnectionCreateParams<T extends CRMProviderName> = {
  applicationId: string;
  customerId: string; // external customer id
  integrationId: string;
  category: 'crm';
  providerName: T;
  credentials: ConnectionCredentialsDecrypted<T>;
  remoteId: string;
};

export type ConnectionCreateParamsAny = {
  [K in CRMProviderName]: ConnectionCreateParams<K>;
}[CRMProviderName];

export type ConnectionUpsertParams<T extends CRMProviderName> = ConnectionCreateParams<T>;

export type ConnectionUpsertParamsAny = {
  [K in CRMProviderName]: ConnectionUpsertParams<K>;
}[CRMProviderName];

export type ConnectionSafe<T extends CRMProviderName> = Omit<ConnectionCreateParams<T>, 'credentials'> & {
  id: string;
  status: ConnectionStatus;
  category: 'crm';
  providerName: T;
};

export type ConnectionSafeAny = {
  [K in CRMProviderName]: ConnectionSafe<K>;
}[CRMProviderName];

export type ConnectionUnsafe<T extends CRMProviderName> = ConnectionCreateParams<T> & {
  id: string;
  status: ConnectionStatus;
  category: 'crm';
  providerName: T;
};

export type ConnectionUnsafeAny = {
  [K in CRMProviderName]: ConnectionUnsafe<K>;
}[CRMProviderName];
