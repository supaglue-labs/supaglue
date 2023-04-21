import { SnakecasedKeys } from '../../snakecased_keys';

export type SnakecasedKeysPhoneNumber = SnakecasedKeys<PhoneNumber>;

export type PhoneNumber = {
  phoneNumber: string | null;
  phoneNumberType: 'work' | 'personal' | 'other';
  isPrimary: boolean;
};
