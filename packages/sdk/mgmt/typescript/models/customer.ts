/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.3.4
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Connection } from './connection';
/**
 * 
 * @export
 * @interface Customer
 */
export interface Customer {
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    applicationId: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    externalIdentifier: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    email: string;
    /**
     * 
     * @type {Array<Connection>}
     * @memberof Customer
     */
    connections?: Array<Connection>;
}
