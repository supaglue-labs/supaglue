/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/salesforce/contacts": {
    /** List contacts */
    get: operations["listContacts"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
  "/salesforce/accounts": {
    /** List accounts */
    get: operations["listAccounts"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
    };
  };
  "/salesforce/list_views/{object_type}": {
    /** List list views */
    get: operations["listListViewss"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_type: "contact" | "account" | "lead" | "opportunity";
      };
    };
  };
  "/salesforce/list_views/{object_type}/{list_id}": {
    /** Get list view membership */
    get: operations["getListViewMembership"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_type: "contact" | "account" | "lead" | "opportunity";
        list_view_id: string;
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
      /** @description The date of the last activity on a contact. The LastActivityDate is set to whichever is more recent -- the LastActivityDate of a related task or event or the LastModifiedDate of a contact's record. */
      LastActivityDate: string | null;
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
      /** @description The date and time when this contact was created. */
      CreatedDate: string;
      /** @description The date and time when this contact was last modified. */
      SystemModstamp: string;
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
      /** @description The date of the last activity on an account. The LastActivityDate is set to whichever is more recent -- the LastActivityDate of a related task or event or the LastModifiedDate of an account's record. */
      LastActivityDate: string | null;
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
      /** @description The date and time when this contact was created. */
      CreatedDate: string;
      /** @description The date and time when this contact was last modified. */
      SystemModstamp: string;
      /** @description The raw data returned by the provider. */
      raw_data: {
        [key: string]: unknown;
      };
    };
    salesforce_list_view_metadata: {
      /**
       * @description The unique identifier for this list view. 
       * @example 12345
       */
      id: string;
      /** @enum {string} */
      object_type?: "contact" | "account" | "lead" | "opportunity";
      /**
       * @description The developer name of this list view. 
       * @example my-list
       */
      name: string;
      /**
       * @description The label for this list view. 
       * @example My List
       */
      label: string;
      /**
       * @description The raw data for this list view. 
       * @example {
       *   "describeUrl": "/services/data/v58.0/sobjects/Account/listviews/00BD0000005WcBeMAK/describe",
       *   "developerName": "NewThisWeek",
       *   "id": "00BD0000005WcBeMAK",
       *   "label": "New This Week",
       *   "resultsUrl": "/services/data/v58.0/sobjects/Account/listviews/00BD0000005WcBeMAK/results",
       *   "soqlCompatible": true,
       *   "url": "/services/data/v58.0/sobjects/Account/listviews/00BD0000005WcBeMAK"
       * }
       */
      raw_data: {
        [key: string]: unknown;
      };
    };
    salesforce_list_view_membership: {
      /** @description The unique identifier for a member of this list view. */
      id: string;
      /**
       * @description The raw data for this list view membership. 
       * @example {
       *   "columns": [
       *     {
       *       "fieldNameOrPath": "Id",
       *       "value": "0012800000bbzSAAAY"
       *     },
       *     {
       *       "fieldNameOrPath": "Email",
       *       "value": "jdoe@example.com"
       *     },
       *     {
       *       "fieldNameOrPath": "FirstName",
       *       "value": "John"
       *     },
       *     {
       *       "fieldNameOrPath": "LastName",
       *       "value": "Doe"
       *     },
       *     {
       *       "fieldNameOrPath": "CreatedDate",
       *       "value": "Fri Aug 01 21:15:46 GMT 2014"
       *     },
       *     {
       *       "fieldNameOrPath": "LastModifiedDate",
       *       "value": "Fri Aug 01 21:15:46 GMT 2014"
       *     },
       *     {
       *       "fieldNameOrPath": "SystemModstamp",
       *       "value": "Fri Aug 01 21:15:46 GMT 2014"
       *     }
       *   ]
       * }
       */
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
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  /** List contacts */
  listContacts: {
    parameters: {
      query?: {
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
        /** @description Number of results to return per page */
        page_size?: string;
        /** @description The pagination cursor value */
        cursor?: string;
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
  listAccounts: {
    parameters: {
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
  /** List list views */
  listListViewss: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_type: "contact" | "account" | "lead" | "opportunity";
      };
    };
    responses: {
      /** @description List Views */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            records: (components["schemas"]["salesforce_list_view_metadata"])[];
          };
        };
      };
    };
  };
  /** Get list view membership */
  getListViewMembership: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_type: "contact" | "account" | "lead" | "opportunity";
        list_view_id: string;
      };
    };
    responses: {
      /** @description List Views */
      200: {
        content: {
          "application/json": {
            pagination: components["schemas"]["pagination"];
            members?: (components["schemas"]["salesforce_list_view_membership"])[];
            metadata?: components["schemas"]["salesforce_list_view_metadata"];
          };
        };
      };
    };
  };
}
