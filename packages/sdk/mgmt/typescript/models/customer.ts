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
/**
 * 
 * @export
 * @interface Customer
 */
export interface Customer {
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    id: any;
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    applicationId: any;
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    externalIdentifier: any;
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    name: any;
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    email: any;
    /**
     * 
     * @type {any}
     * @memberof Customer
     */
    connections?: any;
}
