import type { CategoryOfProviderName, ProviderName, SchemaMappingsConfig } from '.';
import type { EntityMapping } from './entity_mapping';

export type ConnectionStatus = 'available' | 'added' | 'authorized' | 'callable';

export type ApiKeyConnectionCredentialsDecrypted = {
  type: 'api_key';
  apiKey: string;
};

export type AccessKeySecretConnectionCredentialsDecrypted = {
  type: 'access_key_secret';
  accessKey: string;
  accessKeySecret: string;
};

export type OauthConnectionCredentialsDecrypted = {
  type: 'oauth2';
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // null means unknown expiry time
};

export type ConnectionCredentialsDecrypted<T extends ProviderName> = (T extends 'apollo'
  ? ApiKeyConnectionCredentialsDecrypted
  : T extends 'gong'
  ? AccessKeySecretConnectionCredentialsDecrypted | OauthConnectionCredentialsDecrypted
  : OauthConnectionCredentialsDecrypted) &
  (T extends 'salesforce'
    ? {
        instanceUrl: string;
        loginUrl?: string;
      }
    : T extends 'pipedrive'
    ? {
        instanceUrl: string;
      }
    : T extends 'ms_dynamics_365_sales'
    ? {
        instanceUrl: string;
      }
    : object);

export type ConnectionCredentialsDecryptedAny = ConnectionCredentialsDecrypted<ProviderName>;

export type ConnectionCreateParams<T extends ProviderName> = {
  applicationId: string;
  customerId: string; // external customer id
  providerId: string;
  category: CategoryOfProviderName<T>;
  providerName: T;
  credentials: ConnectionCredentialsDecrypted<T>;
  schemaMappingsConfig?: SchemaMappingsConfig;
  entityMappings?: EntityMapping[];
  instanceUrl: string;
};

export type ConnectionCreateParamsAny = ConnectionCreateParams<ProviderName>;

export type ConnectionUpsertParams<T extends ProviderName> = ConnectionCreateParams<T>;

export type ConnectionUpsertParamsAny = ConnectionUpsertParams<ProviderName>;

export type ConnectionUpdateParams = {
  schemaMappingsConfig?: SchemaMappingsConfig | null;
};

export type ConnectionSafe<T extends ProviderName> = Omit<ConnectionCreateParams<T>, 'credentials'> & {
  id: string;
  status: ConnectionStatus;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionSafeAny = ConnectionSafe<ProviderName>;

export type ConnectionUnsafe<T extends ProviderName> = ConnectionCreateParams<T> & {
  id: string;
  status: ConnectionStatus;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionUnsafeAny = ConnectionUnsafe<ProviderName>;
