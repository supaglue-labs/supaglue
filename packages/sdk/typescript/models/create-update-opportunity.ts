/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.3.0
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/**
 * 
 * @export
 * @interface CreateUpdateOpportunity
 */
export interface CreateUpdateOpportunity {
    /**
     * 
     * @type {number}
     * @memberof CreateUpdateOpportunity
     */
    amount?: number | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateOpportunity
     */
    closeDate?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateOpportunity
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateOpportunity
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateOpportunity
     */
    stage?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateOpportunity
     */
    accountId?: string | null;
}
