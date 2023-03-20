/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


/** Type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;

export interface paths {
  "/applications": {
    /**
     * List applications 
     * @description Get a list of applications
     */
    get: operations["getApplications"];
    /** Create application */
    post: operations["createApplication"];
  };
  "/applications/{application_id}": {
    /** Get application */
    get: operations["getApplication"];
    parameters: {
      path: {
        application_id: string;
      };
    };
  };
  "/customers": {
    /**
     * List customers 
     * @description Get a list of customers
     */
    get: operations["getCustomers"];
    /** Upsert customer */
    put: operations["upsertCustomer"];
  };
  "/customers/{customer_id}": {
    /** Get customer */
    get: operations["getCustomer"];
    /** Delete customer */
    delete: operations["deleteCustomer"];
    parameters: {
      path: {
        customer_id: string;
      };
    };
  };
  "/integrations": {
    /**
     * List integrations 
     * @description Get a list of integrations
     */
    get: operations["getIntegrations"];
    /** Create integration */
    post: operations["createIntegration"];
  };
  "/integrations/{integration_id}": {
    /** Get integration */
    get: operations["getIntegration"];
    /** Update integration */
    put: operations["updateIntegration"];
    /** Delete integration */
    delete: operations["deleteIntegration"];
    parameters: {
      path: {
        integration_id: string;
      };
    };
  };
  "/customers/{customer_id}/connections": {
    /**
     * List connections 
     * @description Get a list of connections
     */
    get: operations["getConnections"];
    parameters: {
      path: {
        customer_id: string;
      };
    };
  };
  "/customers/{customer_id}/connections/{connection_id}": {
    /** Get connection */
    get: operations["getConnection"];
    /** Delete connection */
    delete: operations["deleteConnection"];
    parameters: {
      path: {
        customer_id: string;
        connection_id: string;
      };
    };
  };
  "/webhook": {
    /**
     * Get webhook 
     * @description Get webhook details
     */
    get: operations["getWebhook"];
    /** Create webhook */
    post: operations["createWebhook"];
    /** Delete webhook */
    delete: operations["deleteWebhook"];
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

export interface webhooks {
  "webhook": {
    /** Webhook */
    post: operations["webhook"];
  };
}

export interface components {
  schemas: {
    customer: {
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      application_id: string;
      /** @example your-customers-unique-application-id */
      customer_id: string;
      /** @example MyCompany Inc */
      name: string;
      /** @example contact@mycompany.com */
      email: string;
      connections?: (components["schemas"]["connection"])[];
    };
    integration: {
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id: string;
      /** @example 9572d08b-f19f-48cc-a992-1eb7031d3f6a */
      application_id: string;
      category: components["schemas"]["category"];
      /** @enum {string} */
      auth_type: "oauth2";
      provider_name: components["schemas"]["provider_name"];
      config?: components["schemas"]["integration_config"];
    };
    connection: {
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id: string;
      /**
       * @example available 
       * @enum {string}
       */
      status: "available" | "added" | "authorized" | "callable";
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      customer_id: string;
      /** @example 9572d08b-f19f-48cc-a992-1eb7031d3f6a */
      integration_id: string;
      provider_name: components["schemas"]["provider_name"];
      category: components["schemas"]["category"];
    };
    /** @enum {string} */
    category: "crm";
    /**
     * @example {
     *   "provider_app_id": "my_app_id",
     *   "oauth": {
     *     "oauth_scopes": [
     *       "crm.objects.contacts.read",
     *       "crm.objects.companies.read",
     *       "crm.objects.deals.read",
     *       "crm.objects.owners.read",
     *       "crm.objects.contacts.write",
     *       "crm.objects.companies.write",
     *       "crm.objects.deals.write"
     *     ],
     *     "credentials": {
     *       "oauth_client_id": "7393b5a4-5e20-4648-87af-b7b297793fd1",
     *       "oauth_client_secret": "941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a"
     *     }
     *   },
     *   "sync": {
     *     "period_ms": 60000
     *   }
     * }
     */
    integration_config: {
      /** @example my_app_id */
      provider_app_id: string;
      oauth: {
        oauth_scopes: (string)[];
        credentials: {
          /** @example 7393b5a4-5e20-4648-87af-b7b297793fd1 */
          oauth_client_id: string;
          /** @example 941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a */
          oauth_client_secret: string;
        };
      };
      sync: {
        /** @example 60000 */
        period_ms: number;
      };
    };
    /** @enum {string} */
    provider_name: "hubspot" | "salesforce" | "pipedrive" | "zendesk_sell" | "ms_dynamics_365_sales" | "zoho_crm" | "capsule";
    create_update_customer: {
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      application_id: string;
      /** @example your-customers-unique-application-id */
      customer_id: string;
      /** @example MyCompany Inc */
      name: string;
      /** @example contact@mycompany.com */
      email: string;
    };
    create_update_integration: {
      /** @example 9572d08b-f19f-48cc-a992-1eb7031d3f6a */
      application_id: string;
      category: components["schemas"]["category"];
      /** @enum {string} */
      auth_type: "oauth2";
      provider_name: components["schemas"]["provider_name"];
      config?: components["schemas"]["integration_config"];
    };
    webhook: {
      url: string;
      /** @enum {string} */
      request_type: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      notify_on_sync_success: boolean;
      notify_on_sync_error: boolean;
      notify_on_connection_success: boolean;
      notify_on_connection_error: boolean;
      headers?: {
        [key: string]: unknown | undefined;
      };
    };
    sync_info: {
      /** @example Account */
      model_name?: string;
      /** @example 2023-02-22T19:55:17.559Z */
      last_sync_start?: string | null;
      /** @example 2023-02-22T20:55:17.559Z */
      next_sync_start?: string | null;
      /** @enum {string|null} */
      status?: "SYNCING" | "DONE" | null;
    };
    sync_history: {
      /** @example Account */
      model_name?: string;
      error_message?: string | null;
      /** @example 2023-02-22T19:55:17.559Z */
      start_timestamp?: string;
      /** @example 2023-02-22T20:55:17.559Z */
      end_timestamp?: string | null;
      /** @enum {string} */
      status?: "SUCCESS" | "IN_PROGRESS" | "FAILURE";
    };
    "webhook-payload": OneOf<[{
      /** @enum {unknown} */
      type: "SYNC_SUCCESS" | "SYNC_ERROR";
      payload: {
        /** @example e30cbb93-5b05-4186-b6de-1acc10013795 */
        connection_id: string;
        /** @example 2fdbd03d-11f2-4e66-a5e6-2b731c71a12d */
        history_id: string;
        /** @example 100 */
        num_records_synced: number;
        /**
         * @example contact 
         * @enum {string}
         */
        common_model: "opportunity" | "contact" | "account" | "lead" | "user";
        error_message?: string;
      };
    }, {
      /** @enum {unknown} */
      type: "CONNECTION_SUCCESS" | "CONNECTION_ERROR";
      payload: {
        /** @example e30cbb93-5b05-4186-b6de-1acc10013795 */
        customer_id: string;
        /** @example 5a4dbac6-3a56-4ad9-8aa3-e7b7f00be024 */
        integration_id: string;
        /** @enum {string} */
        category: "crm";
        /** @enum {string} */
        provider_name: "hubspot" | "salesforce";
      };
    }]>;
  };
  responses: never;
  parameters: {
    /** @description The pagination cursor value */
    cursor: string;
    /** @description Number of results to return per page */
    page_size: string;
    /** @description The customer ID that uniquely identifies the customer in your application */
    customer_id: string;
    /** @description The provider name */
    provider_name: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  getApplications: {
    /**
     * List applications 
     * @description Get a list of applications
     */
    responses: {
      /** @description Applications */
      200: {
        content: {
          "application/json": (paths["/applications"]["post"]["responses"]["201"]["content"]["application/json"]["schema"])[];
        };
      };
    };
  };
  createApplication: {
    /** Create application */
    requestBody: {
      content: {
        "application/json": {
          /** @example My Production App */
          name: string;
        };
      };
    };
    responses: {
      /** @description Application created */
      201: {
        content: {
          "application/json": {
            /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
            id: string;
            /** @example My Production App */
            name: string;
          };
        };
      };
    };
  };
  getApplication: {
    /** Get application */
    responses: {
      /** @description Application */
      200: {
        content: {
          "application/json": paths["/applications"]["post"]["responses"]["201"]["content"]["application/json"]["schema"];
        };
      };
    };
  };
  getCustomers: {
    /**
     * List customers 
     * @description Get a list of customers
     */
    responses: {
      /** @description Customers */
      200: {
        content: {
          "application/json": (components["schemas"]["customer"])[];
        };
      };
    };
  };
  upsertCustomer: {
    /** Upsert customer */
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_update_customer"];
      };
    };
    responses: {
      /** @description Customer upserted */
      200: {
        content: {
          "application/json": components["schemas"]["customer"];
        };
      };
    };
  };
  getCustomer: {
    /** Get customer */
    responses: {
      /** @description Customer */
      200: {
        content: {
          "application/json": components["schemas"]["customer"];
        };
      };
    };
  };
  deleteCustomer: {
    /** Delete customer */
    responses: {
      /** @description Customer */
      200: {
        content: {
          "application/json": components["schemas"]["customer"];
        };
      };
    };
  };
  getIntegrations: {
    /**
     * List integrations 
     * @description Get a list of integrations
     */
    responses: {
      /** @description Integrations */
      200: {
        content: {
          "application/json": (components["schemas"]["integration"])[];
        };
      };
    };
  };
  createIntegration: {
    /** Create integration */
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_update_integration"];
      };
    };
    responses: {
      /** @description Integration created */
      201: {
        content: {
          "application/json": components["schemas"]["integration"];
        };
      };
    };
  };
  getIntegration: {
    /** Get integration */
    responses: {
      /** @description Integration */
      200: {
        content: {
          "application/json": components["schemas"]["integration"];
        };
      };
    };
  };
  updateIntegration: {
    /** Update integration */
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_update_integration"];
      };
    };
    responses: {
      /** @description Integration */
      200: {
        content: {
          "application/json": components["schemas"]["integration"];
        };
      };
    };
  };
  deleteIntegration: {
    /** Delete integration */
    responses: {
      /** @description Integration */
      200: {
        content: {
          "application/json": components["schemas"]["integration"];
        };
      };
    };
  };
  getConnections: {
    /**
     * List connections 
     * @description Get a list of connections
     */
    responses: {
      /** @description Connections */
      200: {
        content: {
          "application/json": (components["schemas"]["connection"])[];
        };
      };
    };
  };
  getConnection: {
    /** Get connection */
    responses: {
      /** @description Connection */
      200: {
        content: {
          "application/json": components["schemas"]["connection"];
        };
      };
    };
  };
  deleteConnection: {
    /** Delete connection */
    responses: {
      /** @description Connection */
      200: {
        content: {
          "application/json": components["schemas"]["connection"];
        };
      };
    };
  };
  getWebhook: {
    /**
     * Get webhook 
     * @description Get webhook details
     */
    responses: {
      /** @description Applications */
      200: {
        content: {
          "application/json": components["schemas"]["webhook"];
        };
      };
    };
  };
  createWebhook: {
    /** Create webhook */
    requestBody: {
      content: {
        "application/json": components["schemas"]["webhook"];
      };
    };
    responses: {
      /** @description Webhook created */
      201: {
        content: {
          "application/json": components["schemas"]["webhook"];
        };
      };
    };
  };
  deleteWebhook: {
    /** Delete webhook */
    responses: {
      /** @description Webhook deleted */
      200: never;
    };
  };
  getSyncHistory: {
    /**
     * Get Sync History 
     * @description Get a list of Sync History objects.
     */
    parameters?: {
        /** @description The pagination cursor value */
        /** @description Number of results to return per page */
        /** @description The customer ID that uniquely identifies the customer in your application */
        /** @description The provider name */
        /** @description The model name to filter by */
      query?: {
        cursor?: string;
        page_size?: string;
        customer_id?: string;
        provider_name?: string;
        model?: string;
      };
    };
    responses: {
      /** @description Sync History */
      200: {
        content: {
          "application/json": ({
            /** @example eyJpZCI6IjQyNTc5ZjczLTg1MjQtNDU3MC05YjY3LWVjYmQ3MDJjNmIxNCIsInJldmVyc2UiOmZhbHNlfQ== */
            next?: string | null;
            /** @example eyJpZCI6IjBjZDhmYmZkLWU5NmQtNDEwZC05ZjQxLWIwMjU1YjdmNGI4NyIsInJldmVyc2UiOnRydWV9 */
            previous?: string | null;
          }) & {
            results?: (components["schemas"]["sync_history"])[];
          };
        };
      };
    };
  };
  getSyncInfos: {
    /**
     * Get Sync Info 
     * @description Get a list of Sync Info
     */
    parameters?: {
        /** @description The customer ID that uniquely identifies the customer in your application */
        /** @description The provider name */
      query?: {
        customer_id?: string;
        provider_name?: string;
      };
    };
    responses: {
      /** @description Sync Info List */
      200: {
        content: {
          "application/json": (components["schemas"]["sync_info"])[];
        };
      };
    };
  };
  webhook: {
    /** Webhook */
    requestBody?: {
      content: {
        "application/json": components["schemas"]["webhook-payload"];
      };
    };
    responses: {
      /** @description Return a 200 status to indicate that the data was received successfully */
      200: never;
    };
  };
}
