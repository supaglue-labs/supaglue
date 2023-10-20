/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/objects/custom": {
    /**
     * List custom objects (deprecated) 
     * @deprecated
     */
    get: operations["listCustomObjects"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
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
  "/properties": {
    /**
     * List properties 
     * @deprecated
     */
    get: operations["listPropertiesDeprecated"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        /** @description The provider name */
        "x-provider-name": string;
      };
    };
  };
  "/properties/{object_name}": {
    /**
     * List properties (preview) 
     * @description :::note
     * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
     * :::
     */
    get: operations["listPropertiesPreview"];
    /**
     * Create property 
     * @description :::note
     * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
     * :::
     * Creates a custom property in the provider and registers it in Supaglue.
     */
    post: operations["createProperty"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
      };
    };
  };
  "/properties/{object_name}/register": {
    /**
     * Register Property (preview) 
     * @description :::note
     * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
     * :::
     * Registers a custom property in Supaglue.
     * This may be useful for custom properties that were already created in the Customer's provider.
     * E.g. a custom field has some machine ID for a particular customer that you want to map to `my_custom_field`.
     */
    post: operations["registerProperty"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
      };
    };
  };
  "/properties/{object_name}/{property_name}": {
    /**
     * Get property (preview) 
     * @description :::note
     * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
     * :::
     */
    get: operations["getProperty"];
    /**
     * Update property (preview) 
     * @description Update custom property (preview)
     */
    patch: operations["updateProperty"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
        property_name: string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    property_deprecated: {
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
       * @description The type of the property as provided by the third-party Provider. These types are not unified by Supaglue. For Intercom, this is string, integer, boolean, or object. For Outreach, this is integer, boolean, number, array, or string. 
       * @example string
       */
      type?: string;
      /**
       * @description The raw details of the property as provided by the third-party Provider, if available. 
       * @example {}
       */
      raw_details?: {
        [key: string]: unknown;
      };
    };
    property_unified: {
      /**
       * @description The machine name of the property as it appears in the third-party Provider. 
       * @example FirstName
       */
      id: string;
      /** @description Only applicable for custom properties. This represents the unique identifier that can be used to refer to this property across all customers. */
      custom_name?: string;
      /**
       * @description The human-readable name of the property as provided by the third-party Provider. 
       * @example First Name
       */
      label: string;
      /** @description A description of the field. */
      description?: string;
      /**
       * @description Whether or not this field is required. Must be false for Salesforce boolean fields. 
       * @example false
       */
      is_required?: boolean;
      /** @description Required for boolean fields in Salesforce. */
      default_value?: string | number | boolean;
      /**
       * @description Only applicable for Hubspot. If specified, Supaglue will attempt to attach the field to this group if it exists, or create it if it doesn't. 
       * @example supaglue
       */
      group_name?: string;
      type: components["schemas"]["property_type"];
      /** @description Only applicable in Salesforce. If not given, will default to 18. */
      precision?: number;
      /** @description Only applicable in Salesforce. If not given, will default to 0. */
      scale?: number;
      /** @description The list of options for a picklist/multipicklist field. */
      options?: (components["schemas"]["picklist_option"])[];
      /**
       * @description The raw details of the property as provided by the third-party Provider, if available. 
       * @example {}
       */
      raw_details?: {
        [key: string]: unknown;
      };
    };
    /**
     * @description Type of the field.
     * 
     * Support:
     * 
     * <table>
     *   <thead>
     *     <tr>
     *     <th>Field</th>
     *     <th>Hubspot (type-fieldType)</th>
     *     <th>Salesforce</th>
     *     <th>Pipedrive</th>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *      <td>text</td>
     *       <td>string-text</td>
     *       <td>Text</td>
     *       <td>varchar_auto</td>
     *     </tr>
     *     <tr>
     *       <td>textarea</td>
     *       <td>string-textarea</td>
     *       <td>Textarea</td>
     *       <td>text</td>
     *     </tr>
     *     <tr>
     *       <td>number</td>
     *       <td>number-number</td>
     *       <td>Int/Double (depending on scale)</td>
     *       <td>double</td>
     *     </tr>
     *     <tr>
     *       <td>picklist</td>
     *       <td>enumeration-select</td>
     *       <td>Picklist</td>
     *       <td>enum</td>
     *     </tr>
     *     <tr>
     *       <td>multipicklist</td>
     *       <td>enumeration-checkbox</td>
     *       <td>Multipicklist</td>
     *       <td>set</td>
     *     </tr>
     *     <tr>
     *       <td>date</td>
     *       <td>date-date</td>
     *       <td>Date</td>
     *       <td>date</td>
     *     </tr>
     *     <tr>
     *       <td>datetime</td>
     *       <td>datetime-date</td>
     *       <td>Datetime</td>
     *       <td>date</td>
     *     </tr>
     *     <tr>
     *     <td>boolean</td>
     *       <td>bool-booleancheckbox</td>
     *       <td>Checkbox</td>
     *       <td>enum</td>
     *     </tr>
     *   </tbody>
     *   </table>
     *  
     * @enum {string}
     */
    property_type: "text" | "textarea" | "number" | "picklist" | "multipicklist" | "date" | "datetime" | "boolean" | "other";
    picklist_option: {
      /** @example Option 1 */
      label: string;
      /** @example option_1 */
      value: string;
      /** @description A description of this option. */
      description?: string;
      /** @description Defaults to false. */
      hidden?: boolean;
    };
    create_property: {
      /**
       * @description The unique identifier to be used to refer to this property across all customers. Supaglue will use this to appropriately map to the provider field ID.
       *  
       * @example ticketId
       */
      name: string;
      /**
       * @description The human-readable name of the property as provided by the third-party Provider. 
       * @example First Name
       */
      label: string;
      /** @description A description of the field. */
      description?: string;
      /**
       * @description Defaults to false. 
       * @example false
       */
      is_required?: boolean;
      /**
       * @description Only applicable for Hubspot. If specified, Supaglue will attempt to attach the field to this group if it exists, or create it if it doesn't. 
       * @example supaglue
       */
      group_name?: string;
      type: components["schemas"]["property_type"];
      /** @description Only applicable in Salesforce. If not given, will default to 18. */
      precision?: number;
      /** @description Only applicable in Salesforce. If not given, will default to 0. */
      scale?: number;
      /** @description The list of options for a picklist/multipicklist field. */
      options?: (components["schemas"]["picklist_option"])[];
    };
    update_property: {
      /**
       * @description The human-readable name of the property as provided by the third-party Provider. 
       * @example First Name
       */
      label?: string;
      /** @description A description of the field. */
      description?: string;
      /**
       * @description Defaults to false. 
       * @example false
       */
      is_required?: boolean;
      /**
       * @description Only applicable for Hubspot. If specified, Supaglue will attempt to attach the field to this group if it exists, or create it if it doesn't. 
       * @example supaglue
       */
      group_name?: string;
      type?: components["schemas"]["property_type"];
      /** @description Only applicable in Salesforce. If not given, will default to 18. */
      precision?: number;
      /** @description Only applicable in Salesforce. If not given, will default to 0. */
      scale?: number;
      /** @description The list of options for a picklist/multipicklist field. */
      options?: (components["schemas"]["picklist_option"])[];
    };
    standard_object: {
      /** @example ticket */
      name: string;
    };
    simple_custom_object: {
      /** @example 42579f73-8524-4570-9b67-ecbd702c6b14 */
      id: string;
      /** @example ticket */
      name: string;
    };
    /** @enum {string} */
    object_type: "common" | "standard" | "custom";
    object: {
      id: string;
      origin_type: components["schemas"]["object_type"];
    };
    errors: ({
        /**
         * @description The full error message from the remote Provider. The schema and level of detail will vary by Provider. 
         * @example {"code":400,"body":{"status":"error","message":"Property values were not valid: [{\\"isValid\\":false,\\"message\\":\\"Property \\\\\\"__about_us\\\\\\" does not exist\\",\\"error\\":\\"PROPERTY_DOESNT_EXIST\\",\\"name\\":\\"__about_us\\",\\"localizedErrorMessage\\":\\"Property \\\\\\"__about_us\\\\\\" does not exist\\"}]","correlationId":"ac94252c-90b5-45d2-ad1d-9a9f7651d7d2","category":"VALIDATION_ERROR"},"headers":{"access-control-allow-credentials":"false","cf-cache-status":"DYNAMIC","cf-ray":"8053d17b9dae9664-SJC","connection":"close","content-length":"361","content-type":"application/json;charset=utf-8","date":"Mon, 11 Sep 2023 23:51:22 GMT","nel":"{\\"success_fraction\\":0.01,\\"report_to\\":\\"cf-nel\\",\\"max_age\\":604800}","report-to":"{\\"endpoints\\":[{\\"url\\":\\"https://a.nel.cloudflare.com/report/v3?s=FgwuXObO%2Fz6ahUJKsxjDLaXTWjooJ8tB0w4%2B%2BKaulGStx0FGkn1PoJoOx2KrFMfihzNdfAqikq7CmgbdlmwKB8hkmp3eTb68qpg10LXFlRgiSqRhbWM7yYSfo8CXmPBc\\"}],\\"group\\":\\"cf-nel\\",\\"max_age\\":604800}","server":"cloudflare","strict-transport-security":"max-age=31536000; includeSubDomains; preload","vary":"origin, Accept-Encoding","x-content-type-options":"nosniff","x-envoy-upstream-service-time":"91","x-evy-trace-listener":"listener_https","x-evy-trace-route-configuration":"listener_https/all","x-evy-trace-route-service-name":"envoyset-translator","x-evy-trace-served-by-pod":"iad02/hubapi-td/envoy-proxy-6c94986c56-9xsh2","x-evy-trace-virtual-host":"all","x-hubspot-correlation-id":"ac94252c-90b5-45d2-ad1d-9a9f7651d7d2","x-hubspot-ratelimit-interval-milliseconds":"10000","x-hubspot-ratelimit-max":"100","x-hubspot-ratelimit-remaining":"99","x-hubspot-ratelimit-secondly":"10","x-hubspot-ratelimit-secondly-remaining":"9","x-request-id":"ac94252c-90b5-45d2-ad1d-9a9f7651d7d2","x-trace":"2B1B4386362759B6A4C34802AD168B803DDC1BE770000000000000000000"}}
         */
        detail?: string;
        /**
         * @description The Supaglue error code associated with the error. 
         * @example MISSING_REQUIRED_FIELD
         */
        problem_type?: string;
        /**
         * @description A brief description of the error. The schema and type of message will vary by Provider. 
         * @example Property values were not valid
         */
        title?: string;
      })[];
    warnings: ({
        detail?: string;
        problem_type?: string;
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

  /**
   * List custom objects (deprecated) 
   * @deprecated
   */
  listCustomObjects: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    responses: {
      /** @description Custom objects */
      200: {
        content: {
          "application/json": (components["schemas"]["simple_custom_object"])[];
        };
      };
    };
  };
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
  /**
   * List properties 
   * @deprecated
   */
  listPropertiesDeprecated: {
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
            properties: (components["schemas"]["property_deprecated"])[];
          };
        };
      };
    };
  };
  /**
   * List properties (preview) 
   * @description :::note
   * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
   * :::
   */
  listPropertiesPreview: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
      };
    };
    responses: {
      /** @description List properties */
      200: {
        content: {
          "application/json": {
            properties: (components["schemas"]["property_unified"])[];
          };
        };
      };
    };
  };
  /**
   * Create property 
   * @description :::note
   * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
   * :::
   * Creates a custom property in the provider and registers it in Supaglue.
   */
  createProperty: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["create_property"];
      };
    };
    responses: {
      /** @description Create a property */
      200: {
        content: {
          "application/json": components["schemas"]["property_unified"];
        };
      };
    };
  };
  /**
   * Register Property (preview) 
   * @description :::note
   * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
   * :::
   * Registers a custom property in Supaglue.
   * This may be useful for custom properties that were already created in the Customer's provider.
   * E.g. a custom field has some machine ID for a particular customer that you want to map to `my_custom_field`.
   */
  registerProperty: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
      };
    };
    requestBody: {
      content: {
        "application/json": {
          /**
           * @description The machine name of the property as it appears in the third-party Provider. 
           * @example FirstName
           */
          id: string;
          /**
           * @description The unique identifier to be used to refer to this property across all customers. Supaglue will use this to appropriately map to the provider field ID.
           *  
           * @example ticketId
           */
          name: string;
        };
      };
    };
    responses: {
      /** @description Register a property */
      200: {
        content: {
          "application/json": components["schemas"]["property_unified"];
        };
      };
    };
  };
  /**
   * Get property (preview) 
   * @description :::note
   * This feature is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.
   * :::
   */
  getProperty: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
        property_name: string;
      };
    };
    responses: {
      /** @description Get property */
      200: {
        content: {
          "application/json": components["schemas"]["property_unified"];
        };
      };
    };
  };
  /**
   * Update property (preview) 
   * @description Update custom property (preview)
   */
  updateProperty: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
      };
      path: {
        object_name: string;
        property_name: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["update_property"];
      };
    };
    responses: {
      /** @description Create a property */
      200: {
        content: {
          "application/json": components["schemas"]["property_unified"];
        };
      };
    };
  };
}
