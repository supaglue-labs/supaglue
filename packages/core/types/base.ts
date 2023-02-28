export const BILLING_ADDRESS_TYPE = 'BILLING';
export const MAILING_ADDRESS_TYPE = 'MAILING';
export const OTHER_ADDRESS_TYPE = 'OTHER';
export const SHIPPING_ADDRESS_TYPE = 'SHIPPING';

export type Address = {
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  addressType: string | null;
};

export const FAX_PHONE_NUMBER_TYPE = 'Fax';

export type PhoneNumber = {
  phoneNumber: string | null;
  phoneNumberType: string | null;
};

export type EmailAddress = {
  emailAddress: string;
  emailAddressType: string | null;
};
