//https://knowledge.hubspot.com/companies/hubspot-crm-default-company-properties
export type HubspotCompany = {
  /**
   * the unique identifier for the company. This field is set automatically and cannot be edited. This can be used when updating companies through importing or through API.
   */
  id: string;

  /**
   *
   */
  is_deleted: boolean;

  /**
   * a short statement about the company's mission and goals.
   */
  description: string | null;

  /**
   * the city where the company is located.
   */
  city: string | null;

  /**
   * the country where the company is located.
   */
  country: string | null;

  /**
   * postal or zip code for the company.
   */
  zip: string | null;

  /**
   * the state or region where the company is located.
   */
  state: string | null;

  /**
   * the street address of the company.
   */
  address: string | null;

  /**
   * the company's primary phone number.
   */
  phone: string | null;

  /**
   * the type of business the company performs. By default, this property has approximately 150 pre-defined options to select from. These options cannot be deleted, as they are used by HubSpot Insights, but you can add new custom options to meet your needs.
   */
  industry: string | null;

  /**
   * the name of the company.
   */
  name: string | null;

  /**
   * total number of people who work for the company.
   */
  numberofemployees: string | null;

  /**
   * the HubSpot user that the company is assigned to. You can assign additional users to a company record by creating a custom HubSpot user property.
   */
  hubspot_owner_id: string | null;

  /**
   * the company's website domain. HubSpot Insights uses this domain to provide you with basic information about the company. Every property marked with an asterisk (*) can be populated automatically by HubSpot Insights once the domain name is populated.
   */
  domain: string | null;

  /**
   * the company's web address. Filling in this property will also fill in Company domain name.
   */
  website: string | null;

  /**
   * the date the company was added to your account.
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
