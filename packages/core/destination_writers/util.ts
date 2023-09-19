import type { CommonObjectType, ProviderCategory, ProviderName } from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import {
  toSnakecasedKeysCrmAccount,
  toSnakecasedKeysCrmContact,
  toSnakecasedKeysCrmLead,
  toSnakecasedKeysCrmOpportunity,
  toSnakecasedKeysCrmUser,
} from '../mappers/crm';
import {
  toSnakecasedKeysEngagementAccount,
  toSnakecasedKeysEngagementContact,
  toSnakecasedKeysEngagementUser,
  toSnakecasedKeysMailbox,
  toSnakecasedKeysSequence,
  toSnakecasedKeysSequenceState,
  toSnakecasedKeysSequenceStep,
} from '../mappers/engagement';

export const getSnakecasedKeysMapper = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return snakecasedKeysMapperByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return snakecasedKeysMapperByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

const snakecasedKeysMapperByCommonObjectType: {
  crm: Record<CRMCommonObjectType, (obj: any) => any>;
  engagement: Record<EngagementCommonObjectType, (obj: any) => any>;
} = {
  crm: {
    account: toSnakecasedKeysCrmAccount,
    contact: toSnakecasedKeysCrmContact,
    lead: toSnakecasedKeysCrmLead,
    opportunity: toSnakecasedKeysCrmOpportunity,
    user: toSnakecasedKeysCrmUser,
  },
  engagement: {
    account: toSnakecasedKeysEngagementAccount,
    contact: toSnakecasedKeysEngagementContact,
    mailbox: toSnakecasedKeysMailbox,
    sequence: toSnakecasedKeysSequence,
    sequence_state: toSnakecasedKeysSequenceState,
    sequence_step: toSnakecasedKeysSequenceStep,
    user: toSnakecasedKeysEngagementUser,
  },
};

export const shouldDeleteRecords = (isFullSync: boolean, providerName: ProviderName): boolean => {
  return isFullSync && providerName !== 'apollo';
};

export function stripNullCharsFromString(str: string) {
  return str.replace(/\0/g, '');
}

export function jsonStringifyWithoutNullChars(obj: object) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string') {
      return stripNullCharsFromString(value);
    }
    return value;
  });
}
