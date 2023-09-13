/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/objects/standard": {
    /** List standardObjects */
    get: operations["listStandardObjects"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/objects/custom": {
    /** List customObjects */
    get: operations["listCustomObjects"];
    /** Create customObject */
    post: operations["createCustomObject"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/objects/custom/{custom_object_id}": {
    /** Get customObject */
    get: operations["getCustomObject"];
    /** Update customObject */
    put: operations["updateCustomObject"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        custom_object_id: string;
      };
    };
  };
  "/association-types": {
    /**
     * List associationTypes 
     * @description Get a list of associationTypes
     */
    get: operations["getAssociationTypes"];
    /** Create associationType */
    post: operations["createAssociationType"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/properties": {
    /** List properties */
    get: operations["listProperties"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        /** @description The provider name */
        "x-provider-name": string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    property: {
      /**
       * @description The machine name of the property as it appears in the third-party Provider. 
       * @example FirstName
       */
      id: string;
      /**
       * @description The human-readable name of the property as provided by the third-party Provider. 
       * @example First Name
       */
      label: string;
      /**
       * @description The type of the property as provided by the third-party Provider. For Intercom, this is string, integer, boolean, or object. 
       * @example string
       */
      type?: string;
    };
    standard_object: {
      /** @example ticket */
      name: string;
    };
    custom_object: {
      /** @example 42579f73-8524-4570-9b67-ecbd702c6b14 */
      id: string;
      /** @example ticket */
      name: string;
      /** @example Ticket object */
      description: string | null;
      labels: {
        /** @example Ticket */
        singular: string;
        /** @example Tickets */
        plural: string;
      };
      fields: (components["schemas"]["custom_object_field"])[];
    };
    simple_custom_object: {
      /** @example 42579f73-8524-4570-9b67-ecbd702c6b14 */
      id: string;
      /** @example ticket */
      name: string;
    };
    create_update_custom_object: {
      /**
       * @description The name you'd like to use for the custom object. For Salesforce, we will append `__c` if necessary. For HubSpot, it will pass through as-is. 
       * @example ticket
       */
      suggested_name: string;
      /** @example Ticket object */
      description: string | null;
      labels: {
        /** @example Ticket */
        singular: string;
        /** @example Tickets */
        plural: string;
      };
      /**
       * @description The key name of the "primary" field. For example, in HubSpot, this is the field that will be displayed for a record in the UI by default. For Salesforce, this will be referenced as the "Name" field. 
       * @example ticket_id
       */
      primary_field_key_name: string;
      fields: (components["schemas"]["custom_object_field"])[];
    };
    create_update_association_type: {
      source_entity_id: string;
      target_entity_id: string;
      suggested_key_name: string;
      display_name: string;
      cardinality: components["schemas"]["association_type_cardinality"];
    };
    /** @enum {string} */
    object_type: "common" | "standard" | "custom";
    /** @enum {string} */
    association_type_cardinality: "ONE_TO_MANY";
    /** @enum {string} */
    association_type_cardinality_or_unknown: "ONE_TO_MANY" | "UNKNOWN";
    custom_object_field: {
      /** @example Ticket ID */
      display_name: string;
      /**
       * @description In Salesforce, this must end with `__c`. 
       * @example ticket_id
       */
      key_name: string;
      /** @example false */
      is_required: boolean;
      /**
       * @description In Salesforce, when this is set to 'string', the max length will be set to 255 by default. In Salesforce, when it is set to 'number', the precision and scale will be set to 18 and 0, respectively. 
       * @enum {string}
       */
      field_type: "string" | "number";
    };
    association_type: {
      id: string;
      source_entity_id: string;
      target_entity_id: string;
      display_name: string;
      cardinality: components["schemas"]["association_type_cardinality_or_unknown"];
    };
    object: {
      id: string;
      origin_type: components["schemas"]["object_type"];
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

  /** List standardObjects */
  listStandardObjects: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    responses: {
      /** @description StandardObject */
      200: {
        content: {
          "application/json": (components["schemas"]["standard_object"])[];
        };
      };
    };
  };
  /** List customObjects */
  listCustomObjects: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    responses: {
      /** @description CustomObject */
      200: {
        content: {
          "application/json": (components["schemas"]["simple_custom_object"])[];
        };
      };
    };
  };
  /** Create customObject */
  createCustomObject: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    requestBody: {
      content: {
        "application/json": {
          object: components["schemas"]["create_update_custom_object"];
        };
      };
    };
    responses: {
      /** @description CustomObject created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            object?: {
              id: string;
            };
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** Get customObject */
  getCustomObject: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        custom_object_id: string;
      };
    };
    responses: {
      /** @description CustomObject */
      200: {
        content: {
          "application/json": components["schemas"]["custom_object"];
        };
      };
    };
  };
  /** Update customObject */
  updateCustomObject: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        custom_object_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": {
          object: components["schemas"]["create_update_custom_object"];
        };
      };
    };
    responses: {
      /** @description CustomObject updated */
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
  /**
   * List associationTypes 
   * @description Get a list of associationTypes
   */
  getAssociationTypes: {
    parameters: {
      query: {
        source_entity_id: string;
        target_entity_id: string;
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    responses: {
      /** @description AssociationTypes */
      200: {
        content: {
          "application/json": {
            results?: (components["schemas"]["association_type"])[];
          };
        };
      };
    };
  };
  /** Create associationType */
  createAssociationType: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_update_association_type"];
      };
    };
    responses: {
      /** @description AssociationType created */
      201: {
        content: {
          "application/json": {
            errors?: components["schemas"]["errors"];
            association_type?: {
              id: string;
            };
            warnings?: components["schemas"]["warnings"];
          };
        };
      };
    };
  };
  /** List properties */
  listProperties: {
    parameters: {
      query: {
        type: "standard" | "custom";
        name: string;
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        /** @description The provider name */
        "x-provider-name": string;
      };
    };
    responses: {
      /** @description List of properties */
      200: {
        content: {
          "application/json": {
            properties: (components["schemas"]["property"])[];
          };
        };
      };
    };
  };
}
