import { SnakecasedKeys } from '../../snakecased_keys';

export type SnakedcasedKeysEmailAddress = SnakecasedKeys<EmailAddress>;

export type EmailAddress = {
  emailAddress: string;
  emailAddressType: 'personal' | 'work';
  isPrimary: boolean;
};
