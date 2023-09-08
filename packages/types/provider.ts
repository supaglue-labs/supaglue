import type {
  CommonObjectForCategory,
  OAuthConfigDecrypted,
  OAuthConfigEncrypted,
  ProviderCategory,
  Schema,
  SchemaCreateParams,
} from '.';
import type { CRMProviderName } from './crm';
import type { ProviderEntityMapping } from './entity_mapping';
import type { FieldMapping } from './field_mapping_config';

type BaseProvider = {
  id: string;
  applicationId: string;
  entityMappings?: ProviderEntityMapping[];
};

type BaseOauthProvider = BaseProvider & {
  authType: 'oauth2';
  config: ProviderOauthConfigDecrypted;
};

type BaseApiKeyProvider = BaseProvider & {
  authType: 'api_key';
};

export type CRMProvider = BaseOauthProvider & {
  category: 'crm';
  name: CRMProviderName;
  objects?: ProviderObjects<'crm'>;
};

export type EngagementOauthProvider = BaseOauthProvider & {
  category: 'engagement';
  name: 'outreach' | 'salesloft';
  objects?: ProviderObjects<'engagement'>;
};

export type EngagementApiKeyProvider = BaseApiKeyProvider & {
  category: 'engagement';
  name: 'apollo';
  objects?: ProviderObjects<'engagement'>;
};

type MarketoProvider = Omit<BaseOauthProvider, 'authType'> & {
  authType: 'marketo_oauth2';
  category: 'marketing_automation';
  name: 'marketo';
  objects?: ProviderObjects<'marketing_automation'>;
};

export type MarketingAutomationOauthProvider = BaseOauthProvider & {
  category: 'marketing_automation';
  name: 'salesforce_marketing_cloud_account_engagement';
  objects?: ProviderObjects<'marketing_automation'>;
};

export type MarketingAutomationProvider = MarketingAutomationOauthProvider | MarketoProvider;

export type NoCategoryProvider = BaseOauthProvider & {
  category: 'no_category';
  name: 'intercom' | 'gong' | 'linear';
  objects?: ProviderObjects<'no_category'>;
};

// TODO: Template based on provider name
export type EngagementProvider = EngagementOauthProvider | EngagementApiKeyProvider;

export type EnrichmentApiKeyProvider = BaseApiKeyProvider & {
  category: 'enrichment';
  name: 'clearbit' | '6sense';
  objects?: ProviderObjects<'enrichment'>;
};

export type EnrichmentProvider = EnrichmentApiKeyProvider;

export type OauthProvider =
  | CRMProvider
  | EngagementOauthProvider
  | MarketingAutomationOauthProvider
  | NoCategoryProvider;

export type ProviderObjects<T extends ProviderCategory> = {
  common?: ProviderCommonObject<T>[];
  standard?: ProviderObject[];
};

export type ProviderCommonObject<T extends ProviderCategory> = {
  name: CommonObjectForCategory<T>;
  schemaId?: string;
};

export type ProviderObject = {
  name: string;
  schemaId?: string;
};

export type ProviderOauthConfigDecrypted = {
  providerAppId: string;
  oauth: OAuthConfigDecrypted;
  useManagedOauth?: boolean;
};

export type ProviderOauthConfigEncrypted = {
  providerAppId: string;
  oauth: OAuthConfigEncrypted;
  useManagedOauth?: boolean;
};

export type CRMProviderCreateParams = Omit<CRMProvider, 'id'>;
export type CRMProviderUpdateParams = Omit<CRMProvider, 'id' | 'applicationId'>;

export type EngagementProviderCreateParams = Omit<EngagementProvider, 'id'>;
export type EngagementProviderUpdateParams = Omit<EngagementProvider, 'id' | 'applicationId'>;

export type EnrichmentProviderCreateParams = Omit<EnrichmentProvider, 'id'>;
export type EnrichmentProviderUpdateParams = Omit<EnrichmentProvider, 'id' | 'applicationId'>;

export type MarketingAutomationProviderCreateParams = Omit<MarketingAutomationProvider, 'id'>;
export type MarketingAutomationProviderUpdateParams = Omit<MarketingAutomationProvider, 'id' | 'applicationId'>;

export type NoCategoryProviderCreateParams = Omit<NoCategoryProvider, 'id'>;
export type NoCategoryProviderUpdateParams = Omit<NoCategoryProvider, 'id' | 'applicationId'>;

export type Provider =
  | CRMProvider
  | EngagementProvider
  | EnrichmentProvider
  | MarketingAutomationProvider
  | NoCategoryProvider;

export type ProviderCreateParams =
  | CRMProviderCreateParams
  | EngagementProviderCreateParams
  | EnrichmentProviderCreateParams
  | MarketingAutomationProviderCreateParams
  | NoCategoryProviderCreateParams;
export type ProviderUpdateParams =
  | CRMProviderUpdateParams
  | EngagementProviderUpdateParams
  | EnrichmentProviderUpdateParams
  | MarketingAutomationProviderUpdateParams
  | NoCategoryProviderUpdateParams;

export type ProviderConfigMapperArgs = {
  managedOauthConfig: OAuthConfigDecrypted;
};

export type AddObjectToProviderParams = {
  name: string;
  type: 'common' | 'standard';
  enableSync?: boolean;
  schemaId?: string;
  schema?: Omit<SchemaCreateParams, 'applicationId'>;
};

export type ObjectsWithExpandedSchemasAndFieldMappings<T extends ProviderCategory> = {
  common?: (Omit<ProviderCommonObject<T>, 'schemaId'> & { schema?: Schema })[];
  standard?: (Omit<ProviderObject, 'schemaId'> & { schema?: Schema })[];
};

export type AddEntityMappingToProviderParams = {
  entityId: string;
  enableSync?: boolean;
  object: {
    type: 'standard' | 'custom';
    name: string;
  };
  fieldMappings: FieldMapping[];
};
