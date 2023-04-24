import { CategoryOfProviderName, ProviderName } from '.';

export type ConnectionStatus = 'available' | 'added' | 'authorized' | 'callable';

type BaseConnectionCredentialsDecrypted = {
  type: 'oauth2';
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // null means unknown expiry time
};

export type ConnectionCredentialsDecrypted<T extends ProviderName> = BaseConnectionCredentialsDecrypted &
  (T extends 'salesforce'
    ? {
        instanceUrl: string;
        loginUrl?: string;
      }
    : object);

export type ConnectionCredentialsDecryptedAny = {
  [K in ProviderName]: ConnectionCredentialsDecrypted<K>;
}[ProviderName];

export type ConnectionCreateParams<T extends ProviderName> = {
  applicationId: string;
  customerId: string; // external customer id
  integrationId: string;
  category: CategoryOfProviderName<T>;
  providerName: T;
  credentials: ConnectionCredentialsDecrypted<T>;
  instanceUrl: string;
};

export type ConnectionCreateParamsAny = {
  [K in ProviderName]: ConnectionCreateParams<K>;
}[ProviderName];

export type ConnectionUpsertParams<T extends ProviderName> = ConnectionCreateParams<T>;

export type ConnectionUpsertParamsAny = {
  [K in ProviderName]: ConnectionUpsertParams<K>;
}[ProviderName];

export type ConnectionSafe<T extends ProviderName> = Omit<ConnectionCreateParams<T>, 'credentials'> & {
  id: string;
  status: ConnectionStatus;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionSafeAny = {
  [K in ProviderName]: ConnectionSafe<K>;
}[ProviderName];

export type ConnectionUnsafe<T extends ProviderName> = ConnectionCreateParams<T> & {
  id: string;
  status: ConnectionStatus;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionUnsafeAny = {
  [K in ProviderName]: ConnectionUnsafe<K>;
}[ProviderName];
