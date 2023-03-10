/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/customers": {
    /**
     * List customers 
     * @description Get a list of customers
     */
    get: operations["getCustomers"];
    /** Create customer */
    post: operations["createCustomer"];
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
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /**
     * @example [
     *   {
     *     "id": "e888cedf-e9d0-42c5-9485-2d72984faef2"
     *   },
     *   {
     *     "application_id": "d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69"
     *   }
     * ]
     */
    customer: {
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id: string;
      /** @example d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69 */
      application_id: string;
      connections?: (components["schemas"]["connection"])[];
    };
    /**
     * @example [
     *   {
     *     "id": "e888cedf-e9d0-42c5-9485-2d72984faef2",
     *     "category": "crm",
     *     "auth_type": "oauth2",
     *     "provider_name": "hubspot",
     *     "config": [
     *       {
     *         "remote_provider_app_id": "my_app_id",
     *         "oauth": [
     *           {
     *             "oauth_scopes": [
     *               "crm.objects.contacts.read",
     *               "crm.objects.companies.read",
     *               "crm.objects.deals.read",
     *               "crm.objects.contacts.write",
     *               "crm.objects.companies.write",
     *               "crm.objects.deals.write"
     *             ],
     *             "credentials": [
     *               {
     *                 "oauth_client_id": "7393b5a4-5e20-4648-87af-b7b297793fd1",
     *                 "oauth_client_secret": "941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a"
     *               }
     *             ]
     *           }
     *         ]
     *       },
     *       {
     *         "sync": [
     *           {
     *             "period_ms": 60000
     *           }
     *         ]
     *       }
     *     ]
     *   }
     * ]
     */
    integration: {
      /** @example e888cedf-e9d0-42c5-9485-2d72984faef2 */
      id: string;
      /** @example 9572d08b-f19f-48cc-a992-1eb7031d3f6a */
      application_id: string;
      category: components["schemas"]["category"];
      /** @enum {string} */
      auth_type: "oauth2";
      provider_name: components["schemas"]["provider_name"];
      config: components["schemas"]["integration_config"];
    };
    /**
     * @example [
     *   {
     *     "id": "e888cedf-e9d0-42c5-9485-2d72984faef2",
     *     "customer_id": "d8ceb3ff-8b7f-4fa7-b8de-849292f6ca69",
     *     "status": "available",
     *     "integration_id": "9572d08b-f19f-48cc-a992-1eb7031d3f6a",
     *     "provider_name": "salesforce",
     *     "category": "crm",
     *     "credentials": [
     *       {
     *         "type": "oauth2",
     *         "access_token": "00DDn000004L1rN!AQwAQFcdcvZCaMN83FUDEI5BHyjWILUCMH91UOX7xPVAgn2DjT9LrYTX8RT9vSQ281kBUtQBNsjBKC6R4lIlQTLLvCTuYxtJ",
     *         "refresh_token": "5Aep861J.7rrvmXwLwV8Hw86X7cQtxqOq1cNOt9LLourdPAeVgOQHl7idtvQp_e70Q_r20DpwpB4Mo.45QlO29e",
     *         "instance_url": "https://myapp-dev-ed.develop.my.salesforce.com",
     *         "expires_at": "2023-03-09T21:55:54.000Z"
     *       }
     *     ]
     *   }
     * ]
     */
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
      credentials: components["schemas"]["connection_credentials"];
      provider_name: components["schemas"]["provider_name"];
      category: components["schemas"]["category"];
    };
    /**
     * @example [
     *   {
     *     "type": "oauth2",
     *     "access_token": "00DDn000004L1rN!AQwAQFcdcvZCaMN83FUDEI5BHyjWILUCMH91UOX7xPVAgn2DjT9LrYTX8RT9vSQ281kBUtQBNsjBKC6R4lIlQTLLvCTuYxtJ",
     *     "refresh_token": "5Aep861J.7rrvmXwLwV8Hw86X7cQtxqOq1cNOt9LLourdPAeVgOQHl7idtvQp_e70Q_r20DpwpB4Mo.45QlO29e",
     *     "instance_url": "https://myapp-dev-ed.develop.my.salesforce.com",
     *     "expires_at": "2023-03-09T21:55:54.000Z"
     *   }
     * ]
     */
    connection_credentials: {
      /** @example oauth2 */
      type?: string;
      /** @example 00DDn000004L1rN!AQwAQFcdcvZCaMN83FUDEI5BHyjWILUCMH91UOX7xPVAgn2DjT9LrYTX8RT9vSQ281kBUtQBNsjBKC6R4lIlQTLLvCTuYxtJ */
      access_token?: string;
      /** @example 5Aep861J.7rrvmXwLwV8Hw86X7cQtxqOq1cNOt9LLourdPAeVgOQHl7idtvQp_e70Q_r20DpwpB4Mo.45QlO29e */
      refresh_token?: string;
      /** @example https://myapp-dev-ed.develop.my.salesforce.com */
      instance_url?: string;
      /** @example 2023-03-09T21:55:54.000Z */
      expires_at?: string | null;
    };
    /** @enum {string} */
    category: "crm";
    /**
     * @example [
     *   {
     *     "remote_provider_app_id": "my_app_id"
     *   },
     *   {
     *     "oauth": [
     *       {
     *         "oauth_scopes": [
     *           "crm.objects.contacts.read",
     *           "crm.objects.companies.read",
     *           "crm.objects.deals.read",
     *           "crm.objects.contacts.write",
     *           "crm.objects.companies.write",
     *           "crm.objects.deals.write"
     *         ]
     *       },
     *       {
     *         "credentials": [
     *           {
     *             "oauth_client_id": "7393b5a4-5e20-4648-87af-b7b297793fd1"
     *           },
     *           {
     *             "oauth_client_secret": "941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a"
     *           }
     *         ]
     *       }
     *     ]
     *   },
     *   {
     *     "sync": [
     *       {
     *         "period_ms": 60000
     *       }
     *     ]
     *   }
     * ]
     */
    integration_config: {
      /** @example my_app_id */
      remote_provider_app_id: string;
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
    };
    create_update_integration: {
      /** @example 9572d08b-f19f-48cc-a992-1eb7031d3f6a */
      application_id: string;
      category: components["schemas"]["category"];
      /** @enum {string} */
      auth_type: "oauth2";
      provider_name: components["schemas"]["provider_name"];
      config: components["schemas"]["integration_config"];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

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
  createCustomer: {
    /** Create customer */
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_update_customer"];
      };
    };
    responses: {
      /** @description Customer created */
      201: {
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
}
