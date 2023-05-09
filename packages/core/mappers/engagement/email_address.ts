import { EmailAddress } from '@supaglue/types/engagement/common';

export const toSnakecasedKeysEmailAddress = (emailAddress: EmailAddress) => {
  return {
    email_address: emailAddress.emailAddress,
    email_address_type: emailAddress.emailAddressType,
  };
};
