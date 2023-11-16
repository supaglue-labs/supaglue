/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/forms/{form_id}/_submit": {
    /** Submit form */
    post: operations["submitForm"];
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        /** @example 12345 */
        form_id: string;
      };
    };
  };
  "/forms": {
    /** List forms */
    get: operations["listForms"];
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
  };
  "/forms/{form_id}/_fields": {
    /** Get form fields */
    get: operations["getFormFields"];
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        /** @example 12345 */
        form_id: string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    submit_form_response: {
      /**
       * @description The id of the lead that was created/updated as a result of submitting the form
       * @example 12345
       */
      id?: string;
      /** @example updated */
      status: string;
    };
    form_metadata: {
      id: string;
      name: string;
      /**
       * Format: date-time
       * @example 2022-02-27T00:00:00Z
       */
      created_at: Date;
      /**
       * Format: date-time
       * @example 2022-02-27T00:00:00Z
       */
      updated_at: Date;
      raw_data?: {
        [key: string]: unknown;
      };
    };
    form_field: {
      id: string;
      name: string;
      required: boolean;
      form_id: string;
      data_format: string;
      /** @description Selectable options for this field. Only applicable if the data_format is `select`. Only supported for Hubspot and Marketo. */
      data_options?: components["schemas"]["form_data_option"][];
      validation_message?: string | null;
      raw_data?: {
        [key: string]: unknown;
      };
    };
    form_data_option: {
      label: string;
      value: string;
      /** @description If true, will be selected by default. Defaults to false. */
      is_default?: boolean;
    };
    errors: ({
        /**
         * @description A unique identifier for the instance of the error. Provide this to support when contacting Supaglue.
         * @example 9366efb4-8fb1-4a28-bfb0-8d6f9cc6b5c5
         */
        id: string;
        /**
         * @description A detailed description of the error.
         * @example Property values were not valid: [{"isValid":false,"message":"Property \"__about_us\" does not exist","error":"PROPERTY_DOESNT_EXIST","name":"__about_us","localizedErrorMessage":"Property \"__about_us\" does not exist"}]
         */
        detail: string;
        /**
         * @deprecated
         * @description The Supaglue error code associated with the error.
         * @example MISSING_REQUIRED_FIELD
         */
        problem_type: string;
        /**
         * @description A brief description of the error. The schema and type of message will vary by Provider.
         * @example Property values were not valid
         */
        title: string;
        /**
         * @description The Supaglue error code associated with the error.
         * @example MISSING_REQUIRED_FIELD
         */
        code: string;
        /**
         * @description The HTTP status code associated with the error.
         * @example 400
         */
        status: string;
        /** @description Additional metadata about the error. */
        meta: {
          /**
           * @description The cause of the error. Usually the underlying error from the remote Provider.
           * @example {
           *   "code": 400,
           *   "body": {
           *     "status": "error",
           *     "message": "Property values were not valid: [{\"isValid\":false,\"message\":\"Property \\\"__about_us\\\" does not exist\",\"error\":\"PROPERTY_DOESNT_EXIST\",\"name\":\"__about_us\",\"localizedErrorMessage\":\"Property \\\"__about_us\\\" does not exist\"}]",
           *     "correlationId": "ac94252c-90b5-45d2-ad1d-9a9f7651d7d2",
           *     "category": "VALIDATION_ERROR"
           *   },
           *   "headers": {
           *     "access-control-allow-credentials": "false",
           *     "cf-cache-status": "DYNAMIC",
           *     "cf-ray": "8053d17b9dae9664-SJC",
           *     "connection": "close",
           *     "content-length": "361",
           *     "content-type": "application/json;charset=utf-8",
           *     "date": "Mon, 11 Sep 2023 23:51:22 GMT",
           *     "nel": "{\"success_fraction\":0.01,\"report_to\":\"cf-nel\",\"max_age\":604800}",
           *     "report-to": "{\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v3?s=FgwuXObO%2Fz6ahUJKsxjDLaXTWjooJ8tB0w4%2B%2BKaulGStx0FGkn1PoJoOx2KrFMfihzNdfAqikq7CmgbdlmwKB8hkmp3eTb68qpg10LXFlRgiSqRhbWM7yYSfo8CXmPBc\"}],\"group\":\"cf-nel\",\"max_age\":604800}",
           *     "server": "cloudflare",
           *     "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
           *     "vary": "origin, Accept-Encoding",
           *     "x-content-type-options": "nosniff",
           *     "x-envoy-upstream-service-time": "91",
           *     "x-evy-trace-listener": "listener_https",
           *     "x-evy-trace-route-configuration": "listener_https/all",
           *     "x-evy-trace-route-service-name": "envoyset-translator",
           *     "x-evy-trace-served-by-pod": "iad02/hubapi-td/envoy-proxy-6c94986c56-9xsh2",
           *     "x-evy-trace-virtual-host": "all",
           *     "x-hubspot-correlation-id": "ac94252c-90b5-45d2-ad1d-9a9f7651d7d2",
           *     "x-hubspot-ratelimit-interval-milliseconds": "10000",
           *     "x-hubspot-ratelimit-max": "100",
           *     "x-hubspot-ratelimit-remaining": "99",
           *     "x-hubspot-ratelimit-secondly": "10",
           *     "x-hubspot-ratelimit-secondly-remaining": "9",
           *     "x-request-id": "ac94252c-90b5-45d2-ad1d-9a9f7651d7d2",
           *     "x-trace": "2B1B4386362759B6A4C34802AD168B803DDC1BE770000000000000000000"
           *   }
           * }
           */
          cause?: Record<string, never>;
          /**
           * @description The origin of the error.
           * @example remote-provider
           * @enum {string}
           */
          origin: "remote-provider" | "supaglue";
          [key: string]: unknown;
        };
      })[];
  };
  responses: {
    /** @description Bad request */
    badRequest: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Conflict */
    conflict: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Forbidden */
    forbidden: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Internal server error */
    internalServerError: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Not found */
    notFound: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Not implemented */
    notImplemented: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Remote provider error */
    remoteProviderError: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Unauthorized */
    unauthorized: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
    /** @description Unprocessable entity */
    unprocessableEntity: {
      content: {
        "application/json": {
          errors?: components["schemas"]["errors"];
        };
      };
    };
  };
  parameters: {
    /**
     * @description The customer ID that uniquely identifies the customer in your application
     * @example my-customer-1
     */
    "x-customer-id": string;
    /**
     * @description The provider name
     * @example salesforce
     */
    "x-provider-name": string;
    /**
     * @description Whether to include raw data fetched from the 3rd party provider.
     * @example true
     */
    include_raw_data?: boolean;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /** Submit form */
  submitForm: {
    parameters: {
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        /** @example 12345 */
        form_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": {
          /**
           * @description a mapping of field name to value for each field in the form
           * @example {
           *   "email": "me@supaglue.com",
           *   "firstName": "George",
           *   "lastName": "Xing"
           * }
           */
          formFields: {
            /**
             * @description the email address of the lead
             * @example me@supaglue.com
             */
            email: string;
            [key: string]: unknown;
          };
        };
      };
    };
    responses: {
      /** @description Information about the lead created or updated by the form submission */
      200: {
        content: {
          "application/json": components["schemas"]["submit_form_response"];
        };
      };
      400: components["responses"]["badRequest"];
      401: components["responses"]["unauthorized"];
      403: components["responses"]["forbidden"];
      404: components["responses"]["notFound"];
      409: components["responses"]["conflict"];
      422: components["responses"]["unprocessableEntity"];
      499: components["responses"]["remoteProviderError"];
      500: components["responses"]["internalServerError"];
      501: components["responses"]["notImplemented"];
    };
  };
  /** List forms */
  listForms: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
    };
    responses: {
      /** @description List of forms and their metadata */
      200: {
        content: {
          "application/json": {
            forms: components["schemas"]["form_metadata"][];
          };
        };
      };
      400: components["responses"]["badRequest"];
      401: components["responses"]["unauthorized"];
      403: components["responses"]["forbidden"];
      404: components["responses"]["notFound"];
      499: components["responses"]["remoteProviderError"];
      500: components["responses"]["internalServerError"];
      501: components["responses"]["notImplemented"];
    };
  };
  /** Get form fields */
  getFormFields: {
    parameters: {
      query?: {
        include_raw_data?: components["parameters"]["include_raw_data"];
      };
      header: {
        "x-customer-id": components["parameters"]["x-customer-id"];
        "x-provider-name": components["parameters"]["x-provider-name"];
      };
      path: {
        /** @example 12345 */
        form_id: string;
      };
    };
    responses: {
      /** @description List of fields on the form with the given ID */
      200: {
        content: {
          "application/json": {
            fields: components["schemas"]["form_field"][];
          };
        };
      };
      400: components["responses"]["badRequest"];
      401: components["responses"]["unauthorized"];
      403: components["responses"]["forbidden"];
      404: components["responses"]["notFound"];
      499: components["responses"]["remoteProviderError"];
      500: components["responses"]["internalServerError"];
      501: components["responses"]["notImplemented"];
    };
  };
}
