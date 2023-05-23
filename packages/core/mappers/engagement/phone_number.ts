import { PhoneNumber, SnakecasedKeysPhoneNumber } from '@supaglue/types/engagement/common';

export const toSnakecasedKeysPhoneNumber = (phoneNumber: PhoneNumber): SnakecasedKeysPhoneNumber => {
  return {
    phone_number: phoneNumber.phoneNumber,
    phone_number_type: phoneNumber.phoneNumberType,
  };
};
