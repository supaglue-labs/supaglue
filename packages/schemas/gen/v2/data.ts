/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/salesforce/contacts": {
    /** List contacts */
    get: operations["listSalesforceContacts"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
  "/salesforce/accounts": {
    /** List accounts */
    get: operations["listSalesforceAccounts"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
  "/hubspot/contacts": {
    /** List contacts */
    get: operations["listHubspotContacts"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
  "/hubspot/companies": {
    /** List companies */
    get: operations["listHubspotCompanies"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    salesforce_contact: {
      /** @description The unique identifier for this contact. */
      Id: string;
      /** @description A description of the contact. */
      Description: string | null;
      /** @description The contact's email address. */
      Email: string | null;
      /** @description ID of the account that's the parent of this contact. This is a relationship field. */
      AccountId: string | null;
      /** @description The contact's first name up to 40 characters. */
      FirstName: string | null;
      /** @description The contact's home phone number. */
      HomePhone: string | null;
      /** @description Indicates whether the object has been moved to the Recycle Bin (true) or not (false). */
      IsDeleted: boolean;
      /**
       * Format: date-time 
       * @description The date of the last activity on a contact. The LastActivityDate is set to whichever is more recent -- the LastActivityDate of a related task or event or the LastModifiedDate of a contact's record.
       */
      LastActivityDate: Date | null;
      /** @description The contact's last name. Maximum size is 80 characters. */
      LastName: string | null;
      /** @description The source of the lead. */
      LeadSource: string | null;
      /** @description The city of the mailing address of this contact. */
      MailingCity: string | null;
      /** @description The country of the mailing address of this contact. */
      MailingCountry: string | null;
      /** @description The postal code of the mailing address of this contact. */
      MailingPostalCode: string | null;
      /** @description The state of the mailijng address of this contact. */
      MailingState: string | null;
      /** @description The street of the mailing address of this contact. */
      MailingStreet: string | null;
      /** @description The contact's mobile phone number. */
      MobilePhone: string | null;
      /** @description ID of the user who owns this contact. This is a relationship field. */
      OwnerId: string | null;
      /** @description The contact's phone number. */
      Phone: string | null;
      /** @description The contact's fax number. */
      Fax: string | null;
      /** @description The contact's title. */
      Title: string | null;
      /**
       * Format: date-time 
       * @description The date and time when this contact was created. 
       * @example 2022-02-27T00:00:00Z
       */
      CreatedDate: Date;
      /**
       * Format: date-time 
       * @description The date and time when this contact was last modified. 
       * @example 2022-02-27T00:00:00Z
       */
      SystemModstamp: Date;
      /** @description The raw data returned by the provider. */
      raw_data: {
        [key: string]: unknown;
      };
    };
    salesforce_account: {
      /** @description The unique identifier for this account. */
      Id: string;
      /** @description A description of the contact. */
      Description: string | null;
      /** @description The city of the billing address of this contact. */
      BillingCity: string | null;
      /** @description The country of the billing address of this contact. */
      BillingCountry: string | null;
      /** @description The postal code of the billing address of this contact. */
      BillingPostalCode: string | null;
      /** @description The state of the billing address of this contact. */
      BillingState: string | null;
      /** @description The street of the billing address of this contact. */
      BillingStreet: string | null;
      /** @description The city of the shipping address of this contact. */
      ShippingCity: string | null;
      /** @description The country of the shipping address of this contact. */
      ShippingCountry: string | null;
      /** @description The postal code of the shipping address of this contact. */
      ShippingPostalCode: string | null;
      /** @description The state of the shipping address of this contact. */
      ShippingState: string | null;
      /** @description The street of the shipping address of this contact. */
      ShippingStreet: string | null;
      /** @description The account's phone number. */
      Phone: string | null;
      /** @description The account's fax number. */
      Fax: string | null;
      /** @description The type of industry in which the account operates. */
      Industry: string | null;
      /**
       * Format: date-time 
       * @description The date of the last activity on an account. The LastActivityDate is set to whichever is more recent -- the LastActivityDate of a related task or event or the LastModifiedDate of an account's record.
       */
      LastActivityDate: Date | null;
      /** @description The name of the account. Maximum size is 255 characters. */
      Name: string | null;
      /** @description The number of employees that work at the account. */
      NumberOfEmployees: number | null;
      /** @description ID of the user who owns this account. This is a relationship field. */
      OwnerId: string | null;
      /** @description The account's website URL. */
      Website: string | null;
      /** @description Indicates whether the object has been moved to the Recycle Bin (true) or not (false). */
      IsDeleted: boolean;
      /**
       * Format: date-time 
       * @description The date and time when this contact was created. 
       * @example 2022-02-27T00:00:00Z
       */
      CreatedDate: Date;
      /**
       * Format: date-time 
       * @description The date and time when this contact was last modified. 
       * @example 2022-02-27T00:00:00Z
       */
      SystemModstamp: Date;
      /** @description The raw data returned by the provider. */
      raw_data: {
        [key: string]: unknown;
      };
    };
    hubspot_contact: {
      /**
       * @description the unique identifier for the contact. This field is set automatically and cannot be edited. This can be used when updating contacts through importing or through API. 
       * @example 501
       */
      id: string;
      /**
       * @description the contact's primary email address. 
       * @example team@supaglue.com
       */
      email: string | null;
      /** @example 101 */
      associatedcompanyid: string | null;
      /**
       * @description the contact's first name. 
       * @example Jane
       */
      firstname: string | null;
      /**
       * @description the contact's primary phone number. The phone number is validated and formatted automatically by HubSpot based on the country code. You can select to turn off automatic formatting on a contact record, either when editing the Phone number property, or adding a phone number to call. 
       * @example (650) 450-8812
       */
      phone: string | null;
      /**
       * @description Indicates whether the object has been moved to the Recycle Bin (true) or not (false). 
       * @example false
       */
      is_deleted: boolean;
      /**
       * @description the contact's last name. 
       * @example Doe
       */
      lastname: string | null;
      /**
       * @description the contact's city of residence. 
       * @example Palo Alto
       */
      city: string | null;
      /**
       * @description the contact's country of residence. This might be set via import, form, or integration. 
       * @example United States
       */
      country: string | null;
      /**
       * @description the contact's zip code. 
       * @example 94303
       */
      zip: string | null;
      /**
       * @description the contact's state of residence. 
       * @example CA
       */
      state: string | null;
      /**
       * @description the contact's street address, including apartment or unit #. 
       * @example 4 Giro's Passage
       */
      address: string | null;
      /**
       * @description the contact's mobile phone number. The phone number is validated and formatted automatically by HubSpot based on the country code. You can select to turn off automatic formatting on a contact record, either when editing the Mobile phone number property, or adding a phone number to call. 
       * @example (650) 450-8811
       */
      mobilephone: string | null;
      /**
       * @description the owner of the contact. This can be any HubSpot user or Salesforce integration user and can be set manually or via Workflows. You can assign additional users to the contact record by creating a custom HubSpot user field type property. 
       * @example 1450461
       */
      hubspot_owner_id: string | null;
      /**
       * @description the contact's primary fax number. 
       * @example (650) 450-8810
       */
      fax: string | null;
      /**
       * @description the contact's job title. 
       * @example CEO
       */
      jobtitle: string | null;
      /**
       * Format: date-time 
       * @description the date that the contact was created in your HubSpot account. 
       * @example 2023-08-01T20:58:17.725Z
       */
      createdate: Date;
      /**
       * Format: date-time 
       * @description the last date and time a note, call, tracked and logged sales email, meeting, LinkedIn/SMS/WhatsApp message, task, or chat was logged on the contact record. This is set automatically by HubSpot based on the most recent date/time set for an activity. For example, if a user logs a call and indicates that it occurred the day before, the Last activity date property will show yesterday's date. 
       * @example 2023-08-01T20:58:17.725Z
       */
      notes_last_updated: Date;
      /** @description The raw data returned by the provider. */
      raw_data: {
        [key: string]: unknown;
      };
    };
    hubspot_company: {
      /**
       * @description the unique identifier for the company. This field is set automatically and cannot be edited. This can be used when updating companies through importing or through API. 
       * @example 101
       */
      id: string;
      /**
       * @description a short statement about the company's mission and goals. 
       * @example Open-source developer platform for customer-facing integrations
       */
      description: string | null;
      /**
       * @description the city where the company is located. 
       * @example San Francisco
       */
      city: string | null;
      /**
       * @description the country where the company is located. 
       * @example United States
       */
      country: string | null;
      /**
       * @description postal or zip code for the company. 
       * @example 94025
       */
      zip: string | null;
      /**
       * @description the state or region where the company is located. 
       * @example CA
       */
      state: string | null;
      /**
       * @description the street address of the company. 
       * @example 525 Brannan St
       */
      address: string | null;
      /**
       * @description the company's primary phone number. 
       * @example (650) 450-8810
       */
      phone: string | null;
      /**
       * @description the type of business the company performs. By default, this property has approximately 150 pre-defined options to select from. These options cannot be deleted, as they are used by HubSpot Insights, but you can add new custom options to meet your needs. 
       * @example COMPUTER SOFTWARE
       */
      industry: string | null;
      /**
       * @description the name of the company. 
       * @example Supaglue
       */
      name: string | null;
      /**
       * @description total number of people who work for the company. 
       * @example 3000
       */
      numberofemployees: string | null;
      /**
       * @description the HubSpot user that the company is assigned to. You can assign additional users to a company record by creating a custom HubSpot user property. 
       * @example 101
       */
      hubspot_owner_id: string | null;
      /**
       * @description the company's website domain. HubSpot Insights uses this domain to provide you with basic information about the company. Every property marked with an asterisk (*) can be populated automatically by HubSpot Insights once the domain name is populated. 
       * @example uos.com.sg
       */
      domain: string | null;
      /**
       * @description the company's web address. Filling in this property will also fill in Company domain name. 
       * @example http://www.uos.com.sg
       */
      website: string | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @description the date the company was added to your account. 
       * @example 2023-08-01T20:58:17.725Z
       */
      createdate: Date;
      /**
       * Format: date-time 
       * @description the last date and time a note, call, tracked and logged sales email, meeting, LinkedIn/SMS/WhatsApp message, task, or chat was logged on the company record. This is set automatically by HubSpot based on the most recent date/time set for an activity. For example, if a user logs a call and indicates that it occurred the day before, the Last activity date property will show yesterday's date. 
       * @example 2023-08-01T20:58:17.725Z
       */
      notes_last_updated: Date;
      /** @description The raw data returned by the provider. */
      raw_data: {
        [key: string]: unknown;
      };
    };
    pagination: {
      /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
      next: string | null;
      /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
      previous: string | null;
      /** @example 100 */
      total_count: number;
    };
    errors: ({
        /** @example name is a required field on model. */
        detail?: string;
        /** @example MISSING_REQUIRED_FIELD */
        problem_type?: string;
        source?: {
          /** @example irure consectetur */
          pointer?: string;
        };
        /** @example Missing Required Field */
        title?: string;
      })[];
    /**
     * @example [
     *   {
     *     "detail": "An unrecognized field, age, was passed in with request data.",
     *     "problem_type": "UNRECOGNIZED_FIELD",
     *     "source": {
     *       "pointer": "Lorem ipsum"
     *     },
     *     "title": "Unrecognized Field"
     *   },
     *   {
     *     "detail": "An unrecognized field, age, was passed in with request data.",
     *     "problem_type": "UNRECOGNIZED_FIELD",
     *     "source": {
     *       "pointer": "in"
     *     },
     *     "title": "Unrecognized Field"
     *   }
     * ]
     */
    warnings: ({
        /** @example An unrecognized field, age, was passed in with request data. */
        detail?: string;
        /** @example UNRECOGNIZED_FIELD */
        problem_type?: string;
        source?: {
          /** @example Lorem ipsum */
          pointer?: string;
        };
        /** @example Unrecognized Field */
        title?: string;
      })[];
  };
  responses: never;
  parameters: {
    /** @description The customer ID that uniquely identifies the customer in your application */
    "x-customer-id": string;
    /** @description The provider name */
    "x-provider-name": string;
    /** @description If provided, will only return objects modified after this datetime */
    modified_after?: Date;
    /** @description If provided, will only return objects modified before this datetime */
    modified_before?: Date;
    /** @description If provided, will only return objects created after this datetime */
    created_after?: Date;
    /** @description If provided, will only return objects created before this datetime */
    created_before?: Date;
    /** @description Whether to include data that was deleted in providers. */
    include_deleted_data?: boolean;
    /** @description Number of results to return per page. (Max: 1000) */
    page_size?: string;
    /** @description The pagination cursor value */
    cursor?: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  /** List contacts */
  listSalesforceContacts: {
    parameters: {
      query?: {
        modified_after?: components["parameters"]["modified_after"];
        page_size?: components["parameters"]["page_size"];
        cursor?: components["parameters"]["cursor"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
    responses: {
      /** @description Contacts */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            records: (components["schemas"]["salesforce_contact"])[];
          };
        };
      };
    };
  };
  /** List accounts */
  listSalesforceAccounts: {
    parameters: {
      query?: {
        modified_after?: components["parameters"]["modified_after"];
        page_size?: components["parameters"]["page_size"];
        cursor?: components["parameters"]["cursor"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
    responses: {
      /** @description Accounts */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            records: (components["schemas"]["salesforce_account"])[];
          };
        };
      };
    };
  };
  /** List contacts */
  listHubspotContacts: {
    parameters: {
      query?: {
        modified_after?: components["parameters"]["modified_after"];
        page_size?: components["parameters"]["page_size"];
        cursor?: components["parameters"]["cursor"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
    responses: {
      /** @description Contacts */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            records: (components["schemas"]["hubspot_contact"])[];
          };
        };
      };
    };
  };
  /** List companies */
  listHubspotCompanies: {
    parameters: {
      query?: {
        modified_after?: components["parameters"]["modified_after"];
        page_size?: components["parameters"]["page_size"];
        cursor?: components["parameters"]["cursor"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
    responses: {
      /** @description Companies */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            records: (components["schemas"]["hubspot_company"])[];
          };
        };
      };
    };
  };
}
