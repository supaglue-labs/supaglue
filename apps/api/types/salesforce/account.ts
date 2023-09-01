export type SalesforceAccount = {
  /**
   * The unique identifier for this account.
   */
  Id: string;

  /**
   * A description of the contact.
   */
  Description: string | null;

  /**
   * The city of the billing address of this contact.
   */
  BillingCity: string | null;

  /**
   * The country of the billing address of this contact.
   */
  BillingCountry: string | null;

  /**
   * The postal code of the billing address of this contact.
   */
  BillingPostalCode: string | null;

  /**
   * The state of the billing address of this contact.
   */
  BillingState: string | null;

  /**
   * The street of the billing address of this contact.
   */
  BillingStreet: string | null;

  /**
   * The city of the shipping address of this contact.
   */
  ShippingCity: string | null;

  /**
   * The country of the shipping address of this contact.
   */
  ShippingCountry: string | null;

  /**
   * The postal code of the shipping address of this contact.
   */
  ShippingPostalCode: string | null;

  /**
   * The state of the shipping address of this contact.
   */
  ShippingState: string | null;

  /**
   * The street of the shipping address of this contact.
   */
  ShippingStreet: string | null;

  /**
   * The account's phone number.
   */
  Phone: string | null;

  /**
   * The account's fax number.
   */
  Fax: string | null;

  /**
   * The type of industry in which the account operates.
   */
  Industry: string | null;

  /**
   * The date of the last activity on an account.
   */
  LastActivityDate: Date | null;

  /**
   * The name of the account. Maximum size is 255 characters.
   */
  Name: string | null;

  /**
   * The number of employees that work at the account.
   */
  NumberOfEmployees: number | null;

  /**
   * ID of the user who owns this account. This is a relationship field.
   */
  OwnerId: string | null;

  /**
   * The account's website URL.
   */
  Website: string | null;

  /**
   * Indicates whether the object has been moved to the Recycle Bin (true) or not (false).
   */
  IsDeleted: boolean;

  /**
   * The date and time when this contact was created.
   */
  CreatedDate: Date;

  /**
   * The date and time when this contact was last modified.
   */
  SystemModstamp: Date;

  /**
   * The raw data returned by the provider.
   */
  raw_data: Record<string, any>;
};
