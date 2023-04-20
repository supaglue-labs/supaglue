import { PhoneNumber } from '@supaglue/types';
import { SnakecasedKeysPhoneNumber } from '@supaglue/types/crm/common/phone_number';

export const toSnakecasedKeysPhoneNumber = (phoneNumber: PhoneNumber): SnakecasedKeysPhoneNumber => {
  return {
    phone_number: phoneNumber.phoneNumber,
    phone_number_type: phoneNumber.phoneNumberType,
  };
};
