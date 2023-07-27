import type {
  CommonObjectForCategory,
  OAuthConfigDecrypted,
  OAuthConfigEncrypted,
  ProviderCategory,
  Schema,
  SchemaCreateParams,
} from '.';
import type { CRMProviderName } from './crm';
import type { EntityMapping } from './entity_mapping';
import type { FieldMapping } from './field_mapping_config';
import type { ObjectType } from './sync';

type BaseProvider = {
  id: string;
  applicationId: string;
  entityMappings?: EntityMapping[];
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
  name: 'outreach' | 'gong' | 'salesloft';
  objects?: ProviderObjects<'engagement'>;
};

export type EngagementApiKeyProvider = BaseApiKeyProvider & {
  category: 'engagement';
  name: 'apollo';
  objects?: ProviderObjects<'engagement'>;
};

export type NoCategoryProvider = BaseOauthProvider & {
  category: 'nocategory';
  name: 'intercom';
  objects?: ProviderObjects<'nocategory'>;
};

// TODO: Template based on provider name
export type EngagementProvider = EngagementOauthProvider | EngagementApiKeyProvider;

export type OauthProvider = CRMProvider | EngagementOauthProvider | NoCategoryProvider;

export type ProviderObjects<T extends ProviderCategory> = {
  common?: ProviderCommonObject<T>[];
  standard?: ProviderObject[];
  custom?: ProviderObject[];
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

export type NoCategoryProviderCreateParams = Omit<NoCategoryProvider, 'id'>;
export type NoCategoryProviderUpdateParams = Omit<NoCategoryProvider, 'id' | 'applicationId'>;

export type Provider = CRMProvider | EngagementProvider | NoCategoryProvider;

export type ProviderCreateParams =
  | CRMProviderCreateParams
  | EngagementProviderCreateParams
  | NoCategoryProviderCreateParams;
export type ProviderUpdateParams =
  | CRMProviderUpdateParams
  | EngagementProviderUpdateParams
  | NoCategoryProviderUpdateParams;

export type ProviderConfigMapperArgs = {
  managedOauthConfig: OAuthConfigDecrypted;
};

export type AddObjectToProviderParams = {
  name: string;
  type: ObjectType;
  enableSync?: boolean;
  schemaId?: string;
  schema?: Omit<SchemaCreateParams, 'applicationId'>;
};

export type ObjectsWithExpandedSchemasAndFieldMappings<T extends ProviderCategory> = {
  common?: (Omit<ProviderCommonObject<T>, 'schemaId'> & { schema?: Schema })[];
  standard?: (Omit<ProviderObject, 'schemaId'> & { schema?: Schema })[];
  custom?: (Omit<ProviderObject, 'schemaId'> & { schema?: Schema })[];
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
