import { Address } from '@supaglue/types/crm/common';

export const toSnakecasedKeysAddress = (address: Address) => {
  return {
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
    address_type: address.addressType,
  };
};
