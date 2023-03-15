export type Address = {
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  addressType: 'primary' | 'billing' | 'mailing' | 'other' | 'shipping';
};

export const FAX_PHONE_NUMBER_TYPE = 'Fax';

export type PhoneNumber = {
  phoneNumber: string | null;
  phoneNumberType: 'primary' | 'mobile' | 'fax';
};

export type EmailAddress = {
  emailAddress: string;
  emailAddressType: 'primary' | 'work';
};
