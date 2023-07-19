import type { SnakecasedKeys } from '../../snakecased_keys';

export type SnakecasedKeysPhoneNumber = SnakecasedKeys<PhoneNumber>;

export type PhoneNumber = {
  phoneNumber: string | null;
  phoneNumberType: PhoneNumberType | null;
};

export type PhoneNumberType = 'work' | 'home' | 'mobile' | 'other';
