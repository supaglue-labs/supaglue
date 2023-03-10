/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/accounts": {
    /**
     * List accounts 
     * @description Get a list of accounts
     */
    get: operations["getAccounts"];
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
    /**
     * List contacts 
     * @description Get a list of contacts
     */
    get: operations["getContacts"];
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
    /**
     * List leads 
     * @description Get a list of leads
     */
    get: operations["getLeads"];
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
    /**
     * List opportunities 
     * @description Get a list of opportunities
     */
    get: operations["getOpportunities"];
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
  "/sync-history": {
    /**
     * Get Sync History 
     * @description Get a list of Sync History objects.
     */
    get: operations["getSyncHistory"];
    
  };
  "/sync-info": {
    /**
     * Get Sync Info 
     * @description Get a list of Sync Info
     */
    get: operations["getSyncInfos"];
    
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    account: {
      addresses?: components["schemas"]["addresses"];
      /** @example Integration API */
      description?: string | null;
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id?: string;
      /** @example API's */
      industry?: string | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_activity_at?: Date | null;
      /** @example Sample Customer */
      name?: string | null;
      /** @example 276000 */
      number_of_employees?: number | null;
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      owner?: string | null;
      phone_numbers?: components["schemas"]["phone_numbers"];
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      created_at?: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      updated_at?: Date | null;
      /** @example https://supaglue.com/ */
      website?: string | null;
    };
    /**
     * @example {
     *   "description": "Integration API",
     *   "industry": "API's",
     *   "last_activity_at": "2022-02-10T00:00:00Z",
     *   "name": "Sample Customer",
     *   "number_of_employees": 276000,
     *   "website": "https://supaglue.com/"
     * }
     */
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
    };
    contact: {
      /** @example fd089246-09b1-4e3b-a60a-7a76314bbcce */
      account_id?: string | null;
      account?: components["schemas"]["account"];
      addresses?: components["schemas"]["addresses"];
      email_addresses?: components["schemas"]["email_addresses"];
      /** @example George */
      first_name?: string | null;
      /** @example 88cc44ca-7a34-4e8b-b0da-51c3aae34daf */
      id?: string;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_activity_at?: Date | null;
      /** @example Xing */
      last_name?: string | null;
      phone_numbers?: components["schemas"]["phone_numbers"];
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      created_at?: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      updated_at?: Date | null;
    };
    create_update_contact: {
      /** @example George */
      first_name?: string | null;
      /** @example Xing */
      last_name?: string | null;
      /** @example 64571bff-48ea-4469-9fa0-ee1a0bab38bd */
      account_id?: string | null;
    };
    lead: {
      addresses?: components["schemas"]["addresses"];
      /** @example Supaglue */
      company?: string | null;
      /** @example 88cc44ca-7a34-4e8b-b0da-51c3aae34daf */
      converted_account_id?: string | null;
      converted_account?: components["schemas"]["account"];
      /** @example 8c8de778-a219-4d6c-848c-1d57b52149f6 */
      converted_contact_id?: string | null;
      converted_contact?: components["schemas"]["contact"];
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      converted_date?: Date | null;
      email_addresses?: components["schemas"]["email_addresses"];
      /** @example George */
      first_name?: string | null;
      /** @example e774484c-4ff2-421f-adfa-12f66ed75b91 */
      id?: string;
      /** @example Xing */
      last_name?: string | null;
      /** @example API Blogger */
      lead_source?: string | null;
      /** @example 62e5e0f7-becd-4ae2-be82-8b4e1d5ed8a2 */
      owner?: string | null;
      phone_numbers?: components["schemas"]["phone_numbers"];
      /**
       * Format: date-time 
       * @example 2023-02-10T00:00:00Z
       */
      created_at?: Date | null;
      /**
       * Format: date-time 
       * @example 2023-02-10T00:00:00Z
       */
      updated_at?: Date | null;
      /** @example Co-Founder */
      title?: string | null;
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
      /** @example ab849b1c-c36b-4d8b-9e45-679b48fc4de7 */
      converted_account_id?: string | null;
      /** @example 64571bff-48ea-4469-9fa0-ee1a0bab38bd */
      converted_contact_id?: string | null;
    };
    opportunity: {
      /** @example fd089246-09b1-4e3b-a60a-7a76314bbcce */
      account_id?: string | null;
      account?: components["schemas"]["account"];
      /** @example 100000 */
      amount?: number | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      close_date?: Date | null;
      /** @example Wants to use open source unified API for third-party integrations */
      description?: string | null;
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id?: string;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      last_activity_at?: Date | null;
      /** @example Needs third-party integrations */
      name?: string | null;
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      owner?: string | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      created_at?: Date | null;
      /**
       * Format: date-time 
       * @example 2023-02-27T00:00:00Z
       */
      updated_at?: Date | null;
      /** @example Closed Won */
      stage?: string | null;
      /** @example OPEN */
      status?: string | null;
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
        /** @example custom_fields is a required field on model. */
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
     *     "address_type": "Shipping",
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
        /** @example Shipping */
        address_type?: string | null;
        /** @example San Francisco */
        city?: string | null;
        /** @example USA */
        country?: string | null;
        /** @example 94107 */
        postal_code?: string | null;
        /** @example CA */
        state?: string | null;
        /** @example 525 Brannan */
        street_1?: string | null;
        /** @example null */
        street_2?: string | null;
      })[];
    /**
     * @example [
     *   {
     *     "email_address": "hello@supaglue.com",
     *     "email_address_type": "Work"
     *   }
     * ]
     */
    email_addresses: ({
        /** @example hello@supaglue.com */
        email_address?: string;
        /** @example Work */
        email_address_type?: string | null;
      })[];
    /**
     * @example [
     *   {
     *     "phone_number": "+14151234567",
     *     "phone_number_type": "Mobile"
     *   }
     * ]
     */
    phone_numbers: ({
        /** @example +14151234567 */
        phone_number?: string | null;
        /** @example Mobile */
        phone_number_type?: string | null;
      })[];
    pagination: {
      /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
      next?: string | null;
      /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
      previous?: string | null;
    };
  };
  responses: never;
  parameters: {
    /** @description If provided, will only return objects created after this datetime */
    created_after: Date;
    /** @description If provided, will only return objects created before this datetime */
    created_before: Date;
    /** @description If provided, will only return objects modified after this datetime */
    updated_after: Date;
    /** @description If provided, will only return objects modified before this datetime */
    updated_before: Date;
    /** @description The pagination cursor value */
    cursor: string;
    /** @description Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces */
    expand: string;
    /** @description Number of results to return per page */
    page_size: string;
    /** @description The customer ID */
    "customer-id": string;
    /** @description The provider name */
    "provider-name": string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  getAccounts: {
    /**
     * List accounts 
     * @description Get a list of accounts
     */
    responses: {
      /** @description Accounts */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["account"])[];
          };
        };
      };
    };
  };
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
  getContacts: {
    /**
     * List contacts 
     * @description Get a list of contacts
     */
    responses: {
      /** @description Contacts */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["contact"])[];
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
         *   "first_name": "George",
         *   "last_activity_at": "2022-02-10T00:00:00Z",
         *   "last_name": "Xing",
         *   "account_id": "64571bff-48ea-4469-9fa0-ee1a0bab38bd"
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
  getLeads: {
    /**
     * List leads 
     * @description Get a list of leads
     */
    responses: {
      /** @description Leads */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["lead"])[];
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
  getOpportunities: {
    /**
     * List opportunities 
     * @description Get a list of opportunities
     */
    responses: {
      /** @description Opportunities */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["opportunity"])[];
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
  getSyncHistory: {
    /**
     * Get Sync History 
     * @description Get a list of Sync History objects.
     */
    parameters?: {
        /** @description The model name to filter by */
      query?: {
        model?: string;
      };
    };
    responses: {
      /** @description Sync History */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & ({
            results?: ({
                /** @example Account */
                model_name?: string;
                error_message?: string | null;
                /** @example 2023-02-22T19:55:17.559Z */
                start_timestamp?: string;
                /** @example 2023-02-22T20:55:17.559Z */
                end_timestamp?: string | null;
                /** @example IN_PROGRESS */
                status?: string;
              })[];
          });
        };
      };
    };
  };
  getSyncInfos: {
    /**
     * Get Sync Info 
     * @description Get a list of Sync Info
     */
    responses: {
      /** @description Sync Info List */
      200: {
        content: {
          "application/json": ({
              /** @example Account */
              model_name?: string;
              /** @example 2023-02-22T19:55:17.559Z */
              last_sync_start?: string | null;
              /** @example 2023-02-22T20:55:17.559Z */
              next_sync_start?: string | null;
              /** @example SYNCING */
              status?: string | null;
            })[];
        };
      };
    };
  };
}
