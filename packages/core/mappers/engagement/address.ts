import { Address, SnakecasedKeysAddress } from '@supaglue/types/engagement/common';

export const toSnakecasedKeysAddress = (address: Address): SnakecasedKeysAddress => {
  return {
    street_1: address.street1,
    street_2: address.street2,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
  };
};
