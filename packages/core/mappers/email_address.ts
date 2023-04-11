import { EmailAddress } from '@supaglue/types';

export const toSnakecasedKeysEmailAddress = (emailAddress: EmailAddress) => {
  return {
    email_address: emailAddress.emailAddress,
    email_address_type: emailAddress.emailAddressType,
  };
};
