export type PhoneNumber = {
  phoneNumber: string | null;
  phoneNumberType: 'work' | 'personal' | 'other';
  isPrimary: boolean;
};
