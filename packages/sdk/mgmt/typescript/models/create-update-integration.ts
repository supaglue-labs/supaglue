/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.3.3
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Category } from './category';
import { IntegrationConfig } from './integration-config';
import { ProviderName } from './provider-name';
/**
 * 
 * @export
 * @interface CreateUpdateIntegration
 */
export interface CreateUpdateIntegration {
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateIntegration
     */
    applicationId: string;
    /**
     * 
     * @type {Category}
     * @memberof CreateUpdateIntegration
     */
    category: Category;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateIntegration
     */
    authType: CreateUpdateIntegrationAuthTypeEnum;
    /**
     * 
     * @type {ProviderName}
     * @memberof CreateUpdateIntegration
     */
    providerName: ProviderName;
    /**
     * 
     * @type {IntegrationConfig}
     * @memberof CreateUpdateIntegration
     */
    config: IntegrationConfig;
}

/**
    * @export
    * @enum {string}
    */
export enum CreateUpdateIntegrationAuthTypeEnum {
    Oauth2 = 'oauth2'
}

