import { EmailAddress, SnakedcasedKeysEmailAddress } from '@supaglue/types/engagement/common';

export const toSnakecasedKeysEmailAddress = (emailAddress: EmailAddress): SnakedcasedKeysEmailAddress => {
  return {
    email_address: emailAddress.emailAddress,
    email_address_type: emailAddress.emailAddressType,
  };
};
