import { CommonModelType, ProviderCategory } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import {
  toSnakecasedKeysCrmAccount,
  toSnakecasedKeysCrmContact,
  toSnakecasedKeysCrmLead,
  toSnakecasedKeysCrmOpportunity,
  toSnakecasedKeysCrmUser,
} from '../mappers/crm';
import {
  toSnakecasedKeysEngagementContact,
  toSnakecasedKeysEngagementUser,
  toSnakecasedKeysMailbox,
  toSnakecasedKeysSequence,
  toSnakecasedKeysSequenceState,
} from '../mappers/engagement';

export const getSnakecasedKeysMapper = (category: ProviderCategory, commonModelType: CommonModelType) => {
  if (category === 'crm') {
    return snakecasedKeysMapperByCommonModelType.crm[commonModelType as CRMCommonModelType];
  }
  return snakecasedKeysMapperByCommonModelType.engagement[commonModelType as EngagementCommonModelType];
};

const snakecasedKeysMapperByCommonModelType: {
  crm: Record<CRMCommonModelType, (obj: any) => any>;
  engagement: Record<EngagementCommonModelType, (obj: any) => any>;
} = {
  crm: {
    account: toSnakecasedKeysCrmAccount,
    contact: toSnakecasedKeysCrmContact,
    lead: toSnakecasedKeysCrmLead,
    opportunity: toSnakecasedKeysCrmOpportunity,
    user: toSnakecasedKeysCrmUser,
  },
  engagement: {
    contact: toSnakecasedKeysEngagementContact,
    mailbox: toSnakecasedKeysMailbox,
    sequence: toSnakecasedKeysSequence,
    sequence_state: toSnakecasedKeysSequenceState,
    user: toSnakecasedKeysEngagementUser,
  },
};
