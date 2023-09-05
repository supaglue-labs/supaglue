export type SalesforceContact = {
  /**
   * The unique identifier for this contact.
   */
  Id: string;

  /**
   * A description of the contact.
   */
  Description: string | null;

  /**
   * The contact's email address.
   */
  Email: string | null;

  /**
   * ID of the account that's the parent of this contact. This is a relationship field.
   */
  AccountId: string | null;

  /**
   * The contact's first name up to 40 characters.
   */
  FirstName: string | null;

  /**
   * The contact's home phone number.
   */
  HomePhone: string | null;

  /**
   * Indicates whether the object has been moved to the Recycle Bin (true) or not (false).
   */
  IsDeleted: boolean;

  /**
   * The date of the last activity on a contact.
   */
  LastActivityDate: Date | null;

  /**
   * The contact's last name. Maximum size is 80 characters.
   */
  LastName: string | null;

  /**
   * The source of the lead.
   */
  LeadSource: string | null;

  /**
   * The city of the mailing address of this contact.
   */
  MailingCity: string | null;

  /**
   * The country of the mailing address of this contact.
   */
  MailingCountry: string | null;

  /**
   * The postal code of the mailing address of this contact.
   */
  MailingPostalCode: string | null;

  /**
   * The state of the mailing address of this contact.
   */
  MailingState: string | null;

  /**
   * The street of the mailing address of this contact.
   */
  MailingStreet: string | null;

  /**
   * The contact's mobile phone number.
   */
  MobilePhone: string | null;

  /**
   * ID of the user who owns this contact. This is a relationship field.
   */
  OwnerId: string | null;

  /**
   * The contact's phone number.
   */
  Phone: string | null;

  /**
   * The contact's fax number.
   */
  Fax: string | null;

  /**
   * The contact's title.
   */
  Title: string | null;

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
