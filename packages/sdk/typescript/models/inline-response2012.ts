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
import { Errors } from './errors';
import { Lead } from './lead';
import { Logs } from './logs';
import { Warnings } from './warnings';
/**
 * 
 * @export
 * @interface InlineResponse2012
 */
export interface InlineResponse2012 {
    /**
     * 
     * @type {Errors}
     * @memberof InlineResponse2012
     */
    errors?: Errors;
    /**
     * 
     * @type {Logs}
     * @memberof InlineResponse2012
     */
    logs?: Logs;
    /**
     * 
     * @type {Lead}
     * @memberof InlineResponse2012
     */
    model?: Lead;
    /**
     * 
     * @type {Warnings}
     * @memberof InlineResponse2012
     */
    warnings?: Warnings;
}
