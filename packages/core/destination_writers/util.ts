import { CommonModel, IntegrationCategory } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import {
  toSnakecasedKeysCrmAccountV2,
  toSnakecasedKeysCrmContactV2,
  toSnakecasedKeysCrmLeadV2,
  toSnakecasedKeysCrmOpportunityV2,
  toSnakecasedKeysCrmSimpleUser,
} from '../mappers/crm';
import {
  toSnakecasedKeysEngagementContactV2,
  toSnakecasedKeysEngagementUserV2,
  toSnakecasedKeysMailboxV2,
  toSnakecasedKeysSequenceStateV2,
  toSnakecasedKeysSequenceV2,
} from '../mappers/engagement';

export const getSnakecasedKeysMapper = (category: IntegrationCategory, commonModelType: CommonModel) => {
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
    account: toSnakecasedKeysCrmAccountV2,
    contact: toSnakecasedKeysCrmContactV2,
    lead: toSnakecasedKeysCrmLeadV2,
    opportunity: toSnakecasedKeysCrmOpportunityV2,
    user: toSnakecasedKeysCrmSimpleUser,
  },
  engagement: {
    contact: toSnakecasedKeysEngagementContactV2,
    mailbox: toSnakecasedKeysMailboxV2,
    sequence: toSnakecasedKeysSequenceV2,
    sequence_state: toSnakecasedKeysSequenceStateV2,
    user: toSnakecasedKeysEngagementUserV2,
  },
};
