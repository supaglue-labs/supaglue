export type Address = {
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  addressType: 'primary' | 'billing' | 'mailing' | 'other' | 'shipping';
};
