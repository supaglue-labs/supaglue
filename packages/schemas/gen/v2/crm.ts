/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/accounts": {
    /** Create account */
    post: operations["createAccount"];
    
  };
  "/accounts/{account_id}": {
    /** Get account */
    get: operations["getAccount"];
    /** Update account */
    patch: operations["updateAccount"];
    parameters: {
      path: {
        account_id: string;
      };
    };
  };
  "/contacts": {
    /** Create contact */
    post: operations["createContact"];
    
  };
  "/contacts/{contact_id}": {
    /** Get contact */
    get: operations["getContact"];
    /** Update contact */
    patch: operations["updateContact"];
    parameters: {
      path: {
        contact_id: string;
      };
    };
  };
  "/leads": {
    /** Create lead */
    post: operations["createLead"];
    
  };
  "/leads/{lead_id}": {
    /** Get lead */
    get: operations["getLead"];
    /** Update lead */
    patch: operations["updateLead"];
    parameters: {
      path: {
        lead_id: string;
      };
    };
  };
  "/opportunities": {
    /** Create opportunity */
    post: operations["createOpportunity"];
    
  };
  "/opportunities/{opportunity_id}": {
    /** Get opportunity */
    get: operations["getOpportunity"];
    /** Update opportunity */
    patch: operations["updateOpportunity"];
    parameters: {
      path: {
        opportunity_id: string;
      };
    };
  };
  "/users/{user_id}": {
    /** Get user */
    get: operations["getUser"];
    parameters: {
      path: {
        user_id: string;
      };
    };
  };
  "/passthrough": {
    /**
     * Send passthrough request 
     * @description Send request directly to a provider
     */
    post: operations["sendPassthroughRequest"];
    
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    account: {
      addresses: components["schemas"]["addresses"];
      /** @example Integration API */
      description: string | null;
      /** @example 1234 */
      id: string;
      /** @example API's */
      industry: string | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_activity_at: Date | null;
      /** @example Sample Customer */
      name: string | null;
      /** @example 276000 */
      number_of_employees: number | null;
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      owner_id: string | null;
      owner?: components["schemas"]["user"];
      phone_numbers: components["schemas"]["phone_numbers"];
      lifecycle_stage: components["schemas"]["lifecycle_stage"];
      /** @example https://supaglue.com/ */
      website: string | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      updated_at: Date | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    create_update_account: {
      /** @example Integration API */
      description?: string | null;
      /** @example API's */
      industry?: string | null;
      /** @example Sample Customer */
      name?: string | null;
      /** @example 276000 */
      number_of_employees?: number | null;
      /** @example https://supaglue.com/ */
      website?: string | null;
      addresses?: components["schemas"]["addresses"];
      phone_numbers?: components["schemas"]["phone_numbers"];
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      lifecycle_stage?: components["schemas"]["lifecycle_stage"];
      custom_fields?: components["schemas"]["custom_fields"];
    };
    contact: {
      /** @example fd089246-09b1-4e3b-a60a-7a76314bbcce */
      account_id: string | null;
      account?: components["schemas"]["account"];
      /** @example 23e640fe-6105-4a11-a636-3aa6b6c6e762 */
      owner_id: string | null;
      owner?: components["schemas"]["user"];
      addresses: components["schemas"]["addresses"];
      email_addresses: components["schemas"]["email_addresses"];
      /** @example George */
      first_name: string | null;
      /** @example 54312 */
      id: string;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_activity_at: Date | null;
      /** @example Xing */
      last_name: string | null;
      phone_numbers: components["schemas"]["phone_numbers"];
      lifecycle_stage: components["schemas"]["lifecycle_stage"];
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      updated_at: Date | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
      raw_data?: {
        [key: string]: unknown | undefined;
      };
    };
    create_update_contact: {
      /** @example George */
      first_name?: string | null;
      /** @example Xing */
      last_name?: string | null;
      /** @example 64571bff-48ea-4469-9fa0-ee1a0bab38bd */
      account_id?: string | null;
      addresses?: components["schemas"]["addresses"];
      email_addresses?: components["schemas"]["email_addresses"];
      phone_numbers?: components["schemas"]["phone_numbers"];
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      lifecycle_stage?: components["schemas"]["lifecycle_stage"];
      custom_fields?: components["schemas"]["custom_fields"];
    };
    lead: {
      addresses: components["schemas"]["addresses"];
      /** @example Supaglue */
      company: string | null;
      /** @example 88cc44ca-7a34-4e8b-b0da-51c3aae34daf */
      converted_account_id: string | null;
      converted_account?: components["schemas"]["account"];
      /** @example 8c8de778-a219-4d6c-848c-1d57b52149f6 */
      converted_contact_id: string | null;
      converted_contact?: components["schemas"]["contact"];
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      converted_date: Date | null;
      email_addresses?: components["schemas"]["email_addresses"];
      /** @example George */
      first_name?: string | null;
      /** @example 54312 */
      id: string;
      /** @example Xing */
      last_name: string | null;
      /** @example API Blogger */
      lead_source: string | null;
      /** @example 62e5e0f7-becd-4ae2-be82-8b4e1d5ed8a2 */
      owner_id: string | null;
      owner?: components["schemas"]["user"];
      phone_numbers: components["schemas"]["phone_numbers"];
      /** @example Co-Founder */
      title: string | null;
      /**
       * Format: date-time 
       * @example 2023-02-10T00:00:00Z
       */
      created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2023-02-10T00:00:00Z
       */
      updated_at: Date | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    create_update_lead: {
      /** @example Supaglue */
      company?: string | null;
      /** @example George */
      first_name?: string | null;
      /** @example Xing */
      last_name?: string | null;
      /** @example API Blogger */
      lead_source?: string | null;
      /** @example Co-Founder */
      title?: string;
      email_addresses?: components["schemas"]["email_addresses"];
      addresses?: components["schemas"]["addresses"];
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      /** @example ad43955d-2b27-4ec3-b38a-0ca07a76d43b */
      converted_contact_id?: string | null;
      /** @example 2e1e6813-0459-47f5-ad4c-3d137c0e1fdd */
      converted_account_id?: string | null;
      custom_fields?: components["schemas"]["custom_fields"];
    };
    opportunity: {
      /** @example fd089246-09b1-4e3b-a60a-7a76314bbcce */
      account_id: string | null;
      account?: components["schemas"]["account"];
      /** @example 100000 */
      amount: number | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      close_date?: Date | null;
      /** @example Wants to use open source unified API for third-party integrations */
      description: string | null;
      /** @example 54312 */
      id: string;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      last_activity_at: Date | null;
      /** @example Needs third-party integrations */
      name: string | null;
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      owner_id: string | null;
      owner?: components["schemas"]["user"];
      pipeline: string | null;
      /** @example Closed Won */
      stage: string | null;
      /** @example OPEN */
      status: string | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      updated_at: Date | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    user: {
      /** @example 54312 */
      id: string;
      /** @example George Xing */
      name: string | null;
      /** @example george@supaglue.com */
      email: string | null;
      is_active: boolean | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      updated_at: Date | null;
      /** @example false */
      is_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    create_update_opportunity: {
      /** @example 100000 */
      amount?: number | null;
      /** @example 2022-02-10T00:00:00Z */
      close_date?: string | null;
      /** @example Wants to use open source unified API for third-party integrations */
      description?: string | null;
      /** @example Needs Integrations */
      name?: string | null;
      /** @example Closed Won */
      stage?: string;
      /** @example 64571bff-48ea-4469-9fa0-ee1a0bab38bd */
      account_id?: string | null;
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      pipeline?: string | null;
      custom_fields?: components["schemas"]["custom_fields"];
    };
    /**
     * @example [
     *   {
     *     "dashboard_view": "https://api.supaglue.com/logs/99433219-8017-4acd-bb3c-ceb23d663832",
     *     "log_id": "99433219-8017-4acd-bb3c-ceb23d663832",
     *     "log_summary": {
     *       "method": "POST",
     *       "status_code": 200,
     *       "url": "https://harvest.greenhouse.io/v1/candidates/"
     *     }
     *   },
     *   {
     *     "dashboard_view": "https://api.supaglue.com/logs/99433219-8017-4acd-bb3c-ceb23d663832",
     *     "log_id": "99433219-8017-4acd-bb3c-ceb23d663832",
     *     "log_summary": {
     *       "method": "POST",
     *       "status_code": 200,
     *       "url": "https://harvest.greenhouse.io/v1/candidates/"
     *     }
     *   }
     * ]
     */
    logs: ({
        /** @example https://api.supaglue.com/logs/99433219-8017-4acd-bb3c-ceb23d663832 */
        dashboard_view?: string;
        /** @example 99433219-8017-4acd-bb3c-ceb23d663832 */
        log_id?: string;
        log_summary?: {
          /** @example POST */
          method?: string;
          /** @example 200 */
          status_code?: number;
          /** @example https://harvest.greenhouse.io/v1/candidates/ */
          url?: string;
        };
      })[];
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
    /**
     * @example [
     *   {
     *     "address_type": "shipping",
     *     "city": "San Francisco",
     *     "country": "US",
     *     "postal_code": "94107",
     *     "state": "CA",
     *     "street_1": "525 Brannan",
     *     "street_2": null
     *   }
     * ]
     */
    addresses: ({
        /** @enum {string} */
        address_type: "primary" | "mailing" | "other" | "billing" | "shipping";
        /** @example San Francisco */
        city: string | null;
        /** @example USA */
        country: string | null;
        /** @example 94107 */
        postal_code: string | null;
        /** @example CA */
        state: string | null;
        /** @example 525 Brannan */
        street_1: string | null;
        /** @example null */
        street_2: string | null;
      })[];
    /**
     * @example [
     *   {
     *     "email_address": "hello@supaglue.com",
     *     "email_address_type": "work"
     *   }
     * ]
     */
    email_addresses: ({
        /** @example hello@supaglue.com */
        email_address: string;
        /** @enum {string} */
        email_address_type: "primary" | "work";
      })[];
    /**
     * @example [
     *   {
     *     "phone_number": "+14151234567",
     *     "phone_number_type": "primary"
     *   }
     * ]
     */
    phone_numbers: ({
        /** @example +14151234567 */
        phone_number: string | null;
        /** @enum {string} */
        phone_number_type: "primary" | "mobile" | "fax";
      })[];
    pagination: {
      /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
      next?: string | null;
      /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
      previous?: string | null;
    };
    /** @description Custom properties to be inserted that are not covered by the common model. Object keys must match exactly to the corresponding provider API. */
    custom_fields: {
      [key: string]: unknown | undefined;
    };
    equals_filter: {
      /** @enum {string} */
      type: "equals";
      value: string;
    };
    contains_filter: {
      /** @enum {string} */
      type: "contains";
      value: string;
    };
    filter: components["schemas"]["equals_filter"] | components["schemas"]["contains_filter"];
    /** @enum {string|null} */
    lifecycle_stage: "subscriber" | "lead" | "marketingqualifiedlead" | "salesqualifiedlead" | "opportunity" | "customer" | "evangelist" | "other" | null;
  };
  responses: never;
  parameters: {
    /** @description Whether to include data that was deleted in providers. */
    include_deleted_data: boolean;
    /** @description Whether to include raw data fetched from the 3rd party provider. */
    include_raw_data: boolean;
    /** @description If provided, will only return objects created after this datetime */
    created_after: Date;
    /** @description If provided, will only return objects created before this datetime */
    created_before: Date;
    /** @description If provided, will only return objects modified after this datetime */
    modified_after: Date;
    /** @description If provided, will only return objects modified before this datetime */
    modified_before: Date;
    /** @description The pagination cursor value */
    cursor: string;
    /** @description Number of results to return per page */
    page_size: string;
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

  createAccount: {
    /** Create account */
    requestBody: {
      content: {
        "application/json": {
          model: components["schemas"]["create_update_account"];
        };
      };
    };
    responses: {
      /** @description Account created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["account"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  getAccount: {
    /** Get account */
    responses: {
      /** @description Account */
      200: {
        content: {
          "application/json": components["schemas"]["account"];
        };
      };
    };
  };
  updateAccount: {
    /** Update account */
    requestBody: {
      content: {
        "application/json": {
          model: components["schemas"]["create_update_account"];
        };
      };
    };
    responses: {
      /** @description Account updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["account"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  createContact: {
    /** Create contact */
    requestBody: {
      content: {
        /**
         * @example {
         *   "model": {
         *     "first_name": "George",
         *     "last_activity_at": "2022-02-10T00:00:00Z",
         *     "last_name": "Xing",
         *     "account_id": "64571bff-48ea-4469-9fa0-ee1a0bab38bd"
         *   }
         * }
         */
        "application/json": {
          model: components["schemas"]["create_update_contact"];
        };
      };
    };
    responses: {
      /** @description Contact created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["contact"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  getContact: {
    /** Get contact */
    responses: {
      /** @description Contact */
      200: {
        content: {
          "application/json": components["schemas"]["contact"];
        };
      };
    };
  };
  updateContact: {
    /** Update contact */
    requestBody: {
      content: {
        "application/json": {
          model: components["schemas"]["create_update_contact"];
        };
      };
    };
    responses: {
      /** @description Contact updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["contact"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  createLead: {
    /** Create lead */
    requestBody: {
      content: {
        /**
         * @example {
         *   "model": {
         *     "company": "Supaglue",
         *     "first_name": "George",
         *     "last_name": "Xing",
         *     "lead_source": "API Blogger",
         *     "title": "Co-Founder"
         *   }
         * }
         */
        "application/json": {
          model: components["schemas"]["create_update_lead"];
        };
      };
    };
    responses: {
      /** @description Lead created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["lead"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  getLead: {
    /** Get lead */
    responses: {
      /** @description Lead */
      200: {
        content: {
          "application/json": components["schemas"]["lead"];
        };
      };
    };
  };
  updateLead: {
    /** Update lead */
    requestBody: {
      content: {
        "application/json": {
          model: components["schemas"]["create_update_lead"];
        };
      };
    };
    responses: {
      /** @description Lead updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["lead"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  createOpportunity: {
    /** Create opportunity */
    requestBody: {
      content: {
        /**
         * @example {
         *   "model": {
         *     "amount": 100000,
         *     "close_date": "2023-02-27T00:00:00Z",
         *     "description": "Wants to use open source unified API for third-party integrations",
         *     "name": "Needs Integrations",
         *     "stage": "Closed Won",
         *     "account_id": "109c88c0-7bf4-4cd8-afbc-b51f9432ca0b"
         *   }
         * }
         */
        "application/json": {
          model: components["schemas"]["create_update_opportunity"];
        };
      };
    };
    responses: {
      /** @description Opportunity created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["opportunity"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  getOpportunity: {
    /** Get opportunity */
    responses: {
      /** @description Opportunity */
      200: {
        content: {
          "application/json": components["schemas"]["opportunity"];
        };
      };
    };
  };
  updateOpportunity: {
    /** Update opportunity */
    requestBody: {
      content: {
        "application/json": {
          model: components["schemas"]["create_update_opportunity"];
        };
      };
    };
    responses: {
      /** @description Opportunity updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            logs?: components["schemas"]["logs"];
            model?: components["schemas"]["opportunity"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  getUser: {
    /** Get user */
    responses: {
      /** @description User */
      200: {
        content: {
          "application/json": components["schemas"]["user"];
        };
      };
    };
  };
  sendPassthroughRequest: {
    /**
     * Send passthrough request 
     * @description Send request directly to a provider
     */
    requestBody: {
      content: {
        "application/json": {
          /** @description The path to send the request to (do not pass the domain) */
          path: string;
          /**
           * @example GET 
           * @enum {string}
           */
          method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
          /** @description Headers to pass to downstream */
          headers?: {
            [key: string]: string | undefined;
          };
          /** @description Query parameters to pass to downstream */
          query?: {
            [key: string]: string | undefined;
          };
          /** @description Body to pass to downstream */
          body?: string;
        };
      };
    };
    responses: {
      /** @description Passthrough response */
      200: {
        content: {
          "application/json": {
            /**
             * @description The full URL the request was went to 
             * @example https://customcrm.com/api/cars
             */
            url: string;
            /**
             * @description Status code from the downstream 
             * @example 200
             */
            status: number;
            /** @description The response headers from the downstream */
            headers: {
              [key: string]: string | undefined;
            };
            /** @description The body from the downstream */
            body?: string | number | number | boolean | (({
                [key: string]: unknown | undefined;
              })[]) | ({
              [key: string]: unknown | undefined;
            });
          };
        };
      };
    };
  };
}
