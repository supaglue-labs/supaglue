import type { CategoryOfProviderName, ProviderName, SchemaMappingsConfig } from '.';
import type { ConnectionEntityMapping } from './entity_mapping';
import type { CustomObjectConfig, StandardObjectConfig } from './sync_object_config';

export type RemoteUserIdAndDetails = {
  userId?: string;
  rawDetails?: Record<string, unknown>;
};

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

export type MarketoOauthConnectionCredentialsDecrypted = {
  type: 'marketo_oauth2';
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  accessToken?: string;
  expiresAt?: string;
};

export type SalesforceMarketingCloudAccountEngagementCredentialsDecrypted = OauthConnectionCredentialsDecrypted & {
  businessUnitId: string;
  loginUrl?: string;
};

export type ImportedConnectionCredentials =
  | {
      providerName: 'salesforce';
      type: 'oauth2';
      refreshToken: string;
      instanceUrl: string;
      loginUrl?: string;
    }
  | {
      providerName: 'hubspot';
      type: 'oauth2';
      refreshToken: string;
    }
  | {
      providerName: 'apollo';
      type: 'api_key';
      apiKey: string;
    }
  | {
      providerName: 'clearbit';
      type: 'api_key';
      apiKey: string;
    }
  | {
      providerName: '6sense';
      type: 'api_key';
      apiKey: string;
    }
  | {
      providerName: 'gong';
      type: 'access_key_secret';
      accessKey: string;
      accessKeySecret: string;
    }
  | {
      providerName: 'marketo';
      type: 'marketo_oauth2';
      clientId: string;
      clientSecret: string;
      instanceUrl: string;
    }
  | {
      providerName: 'salesforce_marketing_cloud_account_engagement';
      type: 'oauth2';
      refreshToken: string;
      businessUnitId: string;
      loginUrl?: string;
    };

export type ConnectionCredentialsDecrypted<T extends ProviderName> = {
  salesforce: OauthConnectionCredentialsDecrypted & {
    instanceUrl: string;
    loginUrl?: string;
  };
  hubspot: OauthConnectionCredentialsDecrypted;
  pipedrive: OauthConnectionCredentialsDecrypted & {
    instanceUrl: string;
  };
  zendesk_sell: OauthConnectionCredentialsDecrypted;
  ms_dynamics_365_sales: OauthConnectionCredentialsDecrypted & {
    instanceUrl: string;
  };
  zoho_crm: OauthConnectionCredentialsDecrypted;
  capsule: OauthConnectionCredentialsDecrypted;
  outreach: OauthConnectionCredentialsDecrypted;
  apollo: ApiKeyConnectionCredentialsDecrypted;
  salesloft: OauthConnectionCredentialsDecrypted;
  gong: AccessKeySecretConnectionCredentialsDecrypted | OauthConnectionCredentialsDecrypted;
  intercom: OauthConnectionCredentialsDecrypted;
  linear: OauthConnectionCredentialsDecrypted;
  clearbit: ApiKeyConnectionCredentialsDecrypted;
  '6sense': ApiKeyConnectionCredentialsDecrypted;
  marketo: MarketoOauthConnectionCredentialsDecrypted;
  salesforce_marketing_cloud_account_engagement: SalesforceMarketingCloudAccountEngagementCredentialsDecrypted;
  slack: OauthConnectionCredentialsDecrypted;
}[T];

export type ConnectionCredentialsDecryptedAny = ConnectionCredentialsDecrypted<ProviderName>;

export type ConnectionSyncConfig = {
  // optionally specify the schema you'd like to write to for postgres
  destinationConfig?: ConnectionSyncDestinationConfig;
  standardObjects?: StandardObjectConfig[];
  customObjects?: CustomObjectConfig[];
};

export type ConnectionSyncDestinationConfig =
  | {
      type: 'postgres';
      schema: string;
    }
  | {
      type: 'bigquery';
      dataset: string;
    };

export type ConnectionCreateParams<T extends ProviderName> = {
  applicationId: string;
  customerId: string; // external customer id
  providerId: string;
  category: CategoryOfProviderName<T>;
  providerName: T;
  credentials: ConnectionCredentialsDecrypted<T>;
  schemaMappingsConfig?: SchemaMappingsConfig;
  entityMappings?: ConnectionEntityMapping[];
  connectionSyncConfig?: ConnectionSyncConfig;
  instanceUrl: string;
};

export type ConnectionCreateParamsAny = ConnectionCreateParams<ProviderName>;

export type ConnectionUpsertParams<T extends ProviderName> = ConnectionCreateParams<T>;

export type ConnectionUpsertParamsAny = ConnectionUpsertParams<ProviderName>;

export type ConnectionSafe<T extends ProviderName> = Omit<ConnectionCreateParams<T>, 'credentials'> & {
  id: string;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionSafeAny = ConnectionSafe<ProviderName>;

export type ConnectionUnsafe<T extends ProviderName> = ConnectionCreateParams<T> & {
  id: string;
  category: CategoryOfProviderName<T>;
  providerName: T;
};

export type ConnectionUnsafeAny = ConnectionUnsafe<ProviderName>;
