/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.3.3
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Contact } from './contact';
import { Pagination } from './pagination';
/**
 * 
 * @export
 * @interface InlineResponse2001
 */
export interface InlineResponse2001 extends Pagination {
    /**
     * 
     * @type {Array<Contact>}
     * @memberof InlineResponse2001
     */
    results?: Array<Contact>;
}
