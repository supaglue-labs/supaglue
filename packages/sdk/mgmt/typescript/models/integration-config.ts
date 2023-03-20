/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.4.1
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { IntegrationConfigOauth } from './integration-config-oauth';
import { IntegrationConfigSync } from './integration-config-sync';
/**
 * 
 * @export
 * @interface IntegrationConfig
 */
export interface IntegrationConfig {
    /**
     * 
     * @type {any}
     * @memberof IntegrationConfig
     */
    providerAppId: any;
    /**
     * 
     * @type {IntegrationConfigOauth}
     * @memberof IntegrationConfig
     */
    oauth: IntegrationConfigOauth;
    /**
     * 
     * @type {IntegrationConfigSync}
     * @memberof IntegrationConfig
     */
    sync: IntegrationConfigSync;
}
