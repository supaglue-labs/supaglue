/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.4.1
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/**
 * 
 * @export
 * @interface InlineResponse2006Results
 */
export interface InlineResponse2006Results {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Results
     */
    modelName?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Results
     */
    errorMessage?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Results
     */
    startTimestamp?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Results
     */
    endTimestamp?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Results
     */
    status?: string;
}
