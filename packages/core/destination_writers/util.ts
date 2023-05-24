import { CommonModel, IntegrationCategory } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import {
  toSnakecasedKeysCrmSimpleAccount,
  toSnakecasedKeysCrmSimpleContact,
  toSnakecasedKeysCrmSimpleLead,
  toSnakecasedKeysCrmSimpleOpportunity,
  toSnakecasedKeysCrmSimpleUser,
} from '../mappers/crm';
import {
  toSnakecasedKeysEngagementSimpleContact,
  toSnakecasedKeysEngagementSimpleUser,
  toSnakecasedKeysSimpleMailbox,
  toSnakecasedKeysSimpleSequence,
  toSnakecasedKeysSimpleSequenceState,
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
    account: toSnakecasedKeysCrmSimpleAccount,
    contact: toSnakecasedKeysCrmSimpleContact,
    lead: toSnakecasedKeysCrmSimpleLead,
    opportunity: toSnakecasedKeysCrmSimpleOpportunity,
    user: toSnakecasedKeysCrmSimpleUser,
  },
  engagement: {
    contact: toSnakecasedKeysEngagementSimpleContact,
    mailbox: toSnakecasedKeysSimpleMailbox,
    sequence: toSnakecasedKeysSimpleSequence,
    sequence_state: toSnakecasedKeysSimpleSequenceState,
    user: toSnakecasedKeysEngagementSimpleUser,
  },
};
