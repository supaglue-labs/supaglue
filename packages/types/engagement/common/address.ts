import type { SnakecasedKeys } from '../../snakecased_keys';

export type SnakecasedKeysAddress = SnakecasedKeys<Address>;
export type Address = {
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};
