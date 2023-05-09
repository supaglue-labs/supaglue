/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/passthrough": {
    /**
     * Send passthrough request 
     * @description Send request directly to a provider
     */
    post: operations["sendPassthroughRequest"];
    
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
  "/users": {
    /**
     * List users 
     * @description Get a list of users
     */
    get: operations["getUsers"];
    
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
  "/sequences": {
    /**
     * List sequences 
     * @description Get a list of sequences
     */
    get: operations["getSequences"];
    
  };
  "/sequences/{sequence_id}": {
    /** Get sequence */
    get: operations["getSequence"];
    parameters: {
      path: {
        sequence_id: string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    contact: {
      /** @example 4cee77aa-50ae-4369-be1e-03f15a55ef10 */
      id: string;
      /** @example 54312 */
      remote_id: string;
      /** @example 23e640fe-6105-4a11-a636-3aa6b6c6e762 */
      owner_id: string | null;
      /** @example George */
      first_name: string | null;
      /** @example Xing */
      last_name: string | null;
      /** @example CEO */
      job_title: string | null;
      address: components["schemas"]["address"];
      email_addresses: components["schemas"]["email_addresses"];
      /**
       * @example [
       *   {
       *     "phone_number": "+14151234567",
       *     "phone_number_type": "work"
       *   }
       * ]
       */
      phone_numbers: ({
          /** @example +14151234567 */
          phone_number: string | null;
          /** @enum {string|null} */
          phone_number_type: "work" | "home" | "mobile" | "other" | null;
        })[];
      open_count: number;
      click_count: number;
      reply_count: number;
      bounced_count: number;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_updated_at: Date | null;
      /** @example false */
      remote_was_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
      raw_data?: {
        [key: string]: unknown | undefined;
      };
    };
    create_contact: {
      /** @example George */
      first_name?: string | null;
      /** @example Xing */
      last_name?: string | null;
      /** @example CEO */
      job_title?: string | null;
      address?: components["schemas"]["address"];
      email_addresses?: components["schemas"]["email_addresses"];
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      custom_fields?: components["schemas"]["custom_fields"];
    };
    user: {
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id: string;
      /** @example 54312 */
      remote_id: string;
      /** @example George */
      first_name: string | null;
      /** @example Xing */
      last_name: string | null;
      /** @example george@supaglue.com */
      email: string | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_updated_at: Date | null;
      /** @example false */
      remote_was_deleted: boolean;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    sequence: {
      /** @example 88588bae-3785-4223-81b7-0649012fdeda */
      id: string;
      /** @example 95fe0d29-e8cc-48ac-9afd-e02d8037a597 */
      owner_id?: string | null;
      /** @example 54312 */
      remote_id: string;
      /** @example true */
      is_enabled: boolean;
      name: string;
      tags: (string)[];
      num_steps: number;
      scheduled_count: number;
      opted_out_count: number;
      replied_count: number;
      clicked_count: number;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_created_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      remote_updated_at: Date | null;
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    start_sequence: {
      id: string;
      fields: {
        contact_id: string;
        mailbox_id: string;
      };
    };
    pagination: {
      /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
      next?: string | null;
      /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
      previous?: string | null;
    };
    /**
     * @example [
     *   {
     *     "city": "San Francisco",
     *     "country": "US",
     *     "postal_code": "94107",
     *     "state": "CA",
     *     "street_1": "525 Brannan",
     *     "street_2": null
     *   }
     * ]
     */
    address: ({
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
    }) | null;
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
        /** @enum {string|null} */
        email_address_type: "personal" | "work" | null;
      })[];
    /** @description Custom properties to be inserted that are not covered by the common model. Object keys must match exactly to the corresponding provider API. */
    custom_fields: {
      [key: string]: unknown | undefined;
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
             * @example https://customengagement.com/api/cars
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
         *   "model": {
         *     "id": "ed7ce0f0-8119-4b73-bf01-4e8e0296ef80",
         *     "address": {
         *       "city": "San Francisco",
         *       "country": "USA",
         *       "street_1": "525 Brannan St",
         *       "street_2": null,
         *       "postalCode": "94107",
         *       "state": "CA"
         *     },
         *     "email_addresses": [
         *       {
         *         "email_address": "hello@supaglue.com",
         *         "email_address_type": "workline2"
         *       }
         *     ],
         *     "first_name": "George",
         *     "remote_id": 1234,
         *     "last_name": "Xing",
         *     "phone_numbers": [
         *       {
         *         "phone_number": "+14151234567",
         *         "phone_number_type": "mobile"
         *       }
         *     ],
         *     "remote_created_at": "2023-02-27T00:00:00Z"
         *   }
         * }
         */
        "application/json": {
          model: components["schemas"]["create_contact"];
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
          model: components["schemas"]["create_contact"];
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
  getUsers: {
    /**
     * List users 
     * @description Get a list of users
     */
    responses: {
      /** @description Users */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["user"])[];
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
  getSequences: {
    /**
     * List sequences 
     * @description Get a list of sequences
     */
    responses: {
      /** @description Sequences */
      200: {
        content: {
          "application/json": components["schemas"]["pagination"] & {
            results?: (components["schemas"]["sequence"])[];
          };
        };
      };
    };
  };
  getSequence: {
    /** Get sequence */
    responses: {
      /** @description Sequence */
      200: {
        content: {
          "application/json": components["schemas"]["sequence"];
        };
      };
    };
  };
}
