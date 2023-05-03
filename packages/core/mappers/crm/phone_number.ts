import { PhoneNumber } from '@supaglue/types/crm/common';

export const toSnakecasedKeysPhoneNumber = (phoneNumber: PhoneNumber) => {
  return {
    phone_number: phoneNumber.phoneNumber,
    phone_number_type: phoneNumber.phoneNumberType,
  };
};
