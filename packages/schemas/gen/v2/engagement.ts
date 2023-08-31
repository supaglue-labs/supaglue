/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


/** OneOf type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;

export interface paths {
  "/passthrough": {
    /**
     * Send passthrough request 
     * @deprecated 
     * @description Send request directly to a provider
     */
    post: operations["sendPassthroughRequest"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/accounts": {
    /** Create account */
    post: operations["createAccount"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/accounts/{account_id}": {
    /** Get account */
    get: operations["getAccount"];
    /** Update account */
    patch: operations["updateAccount"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        account_id: string;
      };
    };
  };
  "/contacts": {
    /** Create contact */
    post: operations["createContact"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/contacts/{contact_id}": {
    /** Get contact */
    get: operations["getContact"];
    /** Update contact */
    patch: operations["updateContact"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        contact_id: string;
      };
    };
  };
  "/users/{user_id}": {
    /** Get user */
    get: operations["getUser"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        user_id: string;
      };
    };
  };
  "/mailboxes/{mailbox_id}": {
    /** Get mailbox */
    get: operations["getMailbox"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        mailbox_id: string;
      };
    };
  };
  "/sequences/{sequence_id}": {
    /** Get sequence */
    get: operations["getSequence"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        sequence_id: string;
      };
    };
  };
  "/sequence_states": {
    /** Create sequence state */
    post: operations["createSequenceState"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/sequence_states/{sequence_state_id}": {
    /** Get sequence state */
    get: operations["getSequenceState"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        sequence_state_id: string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    account: {
      /** @example 54312 */
      id: string;
      /** @example 23e640fe-6105-4a11-a636-3aa6b6c6e762 */
      owner_id: string | null;
      /** @example My Company */
      name: string | null;
      /** @example mycompany.com */
      domain: string | null;
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
        [key: string]: unknown;
      };
    };
    create_account: {
      /** @example My Company */
      name?: string | null;
      /** @example mycompany.com */
      domain?: string | null;
      /** @example 9f3e97fd-4d5d-4efc-959d-bbebfac079f5 */
      owner_id?: string | null;
      /** @example ae4be028-9078-4850-a0bf-d2112b7c4d11 */
      account_id?: string | null;
      custom_fields?: components["schemas"]["custom_fields"];
    };
    contact: {
      /** @example 54312 */
      id: string;
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
          phone_number_type: "primary" | "work" | "home" | "mobile" | "other" | null;
        })[];
      open_count: number;
      click_count: number;
      reply_count: number;
      bounced_count: number;
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
        [key: string]: unknown;
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
      /** @example ae4be028-9078-4850-a0bf-d2112b7c4d11 */
      account_id?: string | null;
      custom_fields?: components["schemas"]["custom_fields"];
    };
    sequence_state: {
      /** @example 54312 */
      id: string;
      /** @example active */
      state: string | null;
      /** @example c590dc63-8e43-48a4-8154-1fbb00ac936b */
      contact_id: string | null;
      /** @example 39fd1fe0-094b-4a61-b47f-3e3ac033203d */
      mailbox_id: string | null;
      /** @example ab0530ef-61dd-4a99-b26b-6b5a61c7c62e */
      user_id: string | null;
      /** @example b854e510-1c40-4ef6-ade4-8eb35f49d331 */
      sequence_id: string | null;
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
    create_sequence_state: {
      /** @example c590dc63-8e43-48a4-8154-1fbb00ac936b */
      contact_id: string;
      /**
       * @description The ID of the mailbox to use for the sequence. Required for Apollo and Outreach. Unused for Salesloft. 
       * @example 39fd1fe0-094b-4a61-b47f-3e3ac033203d
       */
      mailbox_id?: string;
      /** @example b854e510-1c40-4ef6-ade4-8eb35f49d331 */
      sequence_id: string;
      /** @description The ID of the user who is performing the action. Required for Salesloft, optional for Apollo, unused for Outreach. */
      user_id?: string;
    };
    mailbox: {
      /** @example 54312 */
      id: string;
      /** @example null */
      email: string | null;
      /** @example 39fd1fe0-094b-4a61-b47f-3e3ac033203d */
      user_id: string | null;
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
    user: {
      /** @example 54312 */
      id: string;
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
    sequence: {
      /** @example 95fe0d29-e8cc-48ac-9afd-e02d8037a597 */
      owner_id?: string | null;
      /** @example 54312 */
      id: string;
      /** @example true */
      is_enabled: boolean;
      name: string | null;
      tags: (string)[];
      num_steps: number;
      metrics: {
        [key: string]: unknown;
      };
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
      /**
       * Format: date-time 
       * @example 2022-02-27T00:00:00Z
       */
      last_modified_at: Date;
    };
    pagination: {
      /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
      next: string | null;
      /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
      previous: string | null;
      /** @example 100 */
      total_count: number;
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
        email_address_type: "primary" | "personal" | "work" | null;
      })[];
    /** @description Custom properties to be inserted that are not covered by the common object. Object keys must match exactly to the corresponding provider API. */
    custom_fields: {
      [key: string]: unknown;
    };
    created_record: {
      id: string;
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
    /** @description Whether to include data that was deleted in providers. */
    include_deleted_data?: boolean;
    /** @description Whether to include raw data fetched from the 3rd party provider. */
    include_raw_data?: boolean;
    /** @description If provided, will only return objects created after this datetime */
    created_after?: Date;
    /** @description If provided, will only return objects created before this datetime */
    created_before?: Date;
    /** @description If provided, will only return objects modified after this datetime */
    modified_after?: Date;
    /** @description If provided, will only return objects modified before this datetime */
    modified_before?: Date;
    /** @description The pagination cursor value */
    cursor?: string;
    /** @description Number of results to return per page */
    page_size?: string;
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

  /**
   * Send passthrough request 
   * @deprecated 
   * @description Send request directly to a provider
   */
  sendPassthroughRequest: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
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
          /** @description Body to pass to downstream (can be string or JSON object) */
          body?: OneOf<[string, {
            [key: string]: unknown;
          }]>;
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
            body?: string | number | boolean | ({
                [key: string]: unknown;
              })[] | {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  /** Create account */
  createAccount: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    requestBody: {
      content: {
        /**
         * @example {
         *   "record": {
         *     "id": 1234,
         *     "name": "My Company",
         *     "domain": "mycompany.com",
         *     "created_at": "2023-02-27T00:00:00Z"
         *   }
         * }
         */
        "application/json": {
          record: components["schemas"]["create_account"];
        };
      };
    };
    responses: {
      /** @description Account created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            record?: components["schemas"]["created_record"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Get account */
  getAccount: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        account_id: string;
      };
    };
    responses: {
      /** @description Account */
      200: {
        content: {
          "application/json": components["schemas"]["account"];
        };
      };
    };
  };
  /** Update account */
  updateAccount: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        account_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": {
          record: components["schemas"]["create_account"];
        };
      };
    };
    responses: {
      /** @description Account updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Create contact */
  createContact: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    requestBody: {
      content: {
        /**
         * @example {
         *   "record": {
         *     "id": 1234,
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
         *     "last_name": "Xing",
         *     "phone_numbers": [
         *       {
         *         "phone_number": "+14151234567",
         *         "phone_number_type": "mobile"
         *       }
         *     ],
         *     "created_at": "2023-02-27T00:00:00Z"
         *   }
         * }
         */
        "application/json": {
          record: components["schemas"]["create_contact"];
        };
      };
    };
    responses: {
      /** @description Contact created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            record?: components["schemas"]["created_record"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Get contact */
  getContact: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        contact_id: string;
      };
    };
    responses: {
      /** @description Contact */
      200: {
        content: {
          "application/json": components["schemas"]["contact"];
        };
      };
    };
  };
  /** Update contact */
  updateContact: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        contact_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": {
          record: components["schemas"]["create_contact"];
        };
      };
    };
    responses: {
      /** @description Contact updated */
      200: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Get user */
  getUser: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        user_id: string;
      };
    };
    responses: {
      /** @description User */
      200: {
        content: {
          "application/json": components["schemas"]["user"];
        };
      };
    };
  };
  /** Get mailbox */
  getMailbox: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        mailbox_id: string;
      };
    };
    responses: {
      /** @description Mailbox */
      200: {
        content: {
          "application/json": components["schemas"]["mailbox"];
        };
      };
    };
  };
  /** Get sequence */
  getSequence: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        sequence_id: string;
      };
    };
    responses: {
      /** @description Sequence */
      200: {
        content: {
          "application/json": components["schemas"]["sequence"];
        };
      };
    };
  };
  /** Create sequence state */
  createSequenceState: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    requestBody: {
      content: {
        /**
         * @example {
         *   "record": {
         *     "id": "355843a5-c536-4e82-b497-05160bfb7d78",
         *     "state": "active",
         *     "mailbox_id": "a7e860b5-cb8b-400b-812d-921fa526140c",
         *     "contact_id": "6bdcebc2-f886-4de3-88ed-0b9eb420f7b1",
         *     "sequence_id": "45e07817-fd59-4ec8-a727-066d2db27c9b",
         *     "created_at": "2023-02-27T00:00:00Z",
         *     "updated_at": "2023-02-27T00:00:00Z"
         *   }
         * }
         */
        "application/json": {
          record: components["schemas"]["create_sequence_state"];
        };
      };
    };
    responses: {
      /** @description Sequence state created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            record?: components["schemas"]["created_record"];
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Get sequence state */
  getSequenceState: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        sequence_state_id: string;
      };
    };
    responses: {
      /** @description Sequence State */
      200: {
        content: {
          "application/json": components["schemas"]["sequence_state"];
        };
      };
    };
  };
}
