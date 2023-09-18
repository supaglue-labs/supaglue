// https://knowledge.hubspot.com/contacts/hubspots-default-contact-properties
export type HubspotContact = {
  /**
   * the unique identifier for the contact. This field is set automatically and cannot be edited. This can be used when updating contacts through importing or through API.
   */
  id: string;

  /**
   * the contact's primary email address.
   */
  email: string | null;

  /**
   *
   */
  associatedcompanyid: string | null;

  /**
   * the contact's first name.
   */
  firstname: string | null;

  /**
   * the contact's primary phone number. The phone number is validated and formatted automatically by HubSpot based on the country code. You can select to turn off automatic formatting on a contact record, either when editing the Phone number property, or adding a phone number to call.
   */
  phone: string | null;

  /**
   *
   */
  is_deleted: boolean;

  /**
   * the contact's last name.
   */
  lastname: string | null;

  /**
   * the contact's city of residence.
   */
  city: string | null;

  /**
   * the contact's country of residence. This might be set via import, form, or integration.
   */
  country: string | null;

  /**
   * the contact's zip code.
   */
  zip: string | null;

  /**
   * the contact's state of residence.
   */
  state: string | null;

  /**
   * the contact's street address, including apartment or unit #.
   */
  address: string | null;

  /**
   * the contact's mobile phone number. The phone number is validated and formatted automatically by HubSpot based on the country code. You can select to turn off automatic formatting on a contact record, either when editing the Mobile phone number property, or adding a phone number to call.
   */
  mobilephone: string | null;

  /**
   * the owner of the contact. This can be any HubSpot user or Salesforce integration user and can be set manually or via Workflows. You can assign additional users to the contact record by creating a custom HubSpot user field type property.
   */
  hubspot_owner_id: string | null;

  /**
   * the contact's primary fax number.
   */
  fax: string | null;

  /**
   * the contact's job title.
   */
  jobtitle: string | null;

  /**
   * the date that the contact was created in your HubSpot account.
   */
  createdate: Date;

  /**
   * the last date and time a note, call, tracked and logged sales email, meeting, LinkedIn/SMS/WhatsApp message, task, or chat was logged on the company record. This is set automatically by HubSpot based on the most recent date/time set for an activity. For example, if a user logs a call and indicates that it occurred the day before, the Last activity date property will show yesterday's date.
   */
  notes_last_updated: Date;

  /**
   * The raw data returned by the provider.
   */
  raw_data: Record<string, any>;
};
