import { EmailAddress } from '@supaglue/types/crm/common';

export const toSnakecasedKeysEmailAddress = (emailAddress: EmailAddress) => {
  return {
    email_address: emailAddress.emailAddress,
    email_address_type: emailAddress.emailAddressType,
  };
};
