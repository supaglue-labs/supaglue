import { HUBSPOT_STANDARD_OBJECT_TYPES, SALESFORCE_OBJECTS } from '@supaglue/utils';
import { GONG_STANDARD_OBJECTS, INTERCOM_STANDARD_OBJECTS } from '@supaglue/utils/constants';

export const getStandardObjectOptions = (providerName?: string): string[] => {
  switch (providerName) {
    case 'hubspot': {
      return HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[];
    }
    case 'salesforce': {
      return SALESFORCE_OBJECTS as unknown as string[];
    }
    case 'gong': {
      return GONG_STANDARD_OBJECTS as unknown as string[];
    }
    case 'intercom': {
      return INTERCOM_STANDARD_OBJECTS as unknown as string[];
    }
    default:
      return [];
  }
};
