import type { EmailAddress } from '@supaglue/types/crm/common';
import type { SnakedcasedKeysEmailAddress } from '@supaglue/types/crm/common/email_address';

export const toSnakecasedKeysEmailAddress = (emailAddress: EmailAddress): SnakedcasedKeysEmailAddress => {
  return {
    email_address: emailAddress.emailAddress,
    email_address_type: emailAddress.emailAddressType,
  };
};
