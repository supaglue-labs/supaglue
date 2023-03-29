/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.6.0
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Addresses } from './addresses';
import { LifecycleStage } from './lifecycle-stage';
import { PhoneNumbers } from './phone-numbers';
import { User } from './user';
/**
 * 
 * @export
 * @interface Account
 */
export interface Account {
    /**
     * 
     * @type {Addresses}
     * @memberof Account
     */
    addresses: Addresses;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    description: string | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    remoteId: string;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    industry: string | null;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    lastActivityAt: Date | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    name: string | null;
    /**
     * 
     * @type {number}
     * @memberof Account
     */
    numberOfEmployees: number | null;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    ownerId: string | null;
    /**
     * 
     * @type {User}
     * @memberof Account
     */
    owner?: User;
    /**
     * 
     * @type {PhoneNumbers}
     * @memberof Account
     */
    phoneNumbers: PhoneNumbers;
    /**
     * 
     * @type {LifecycleStage}
     * @memberof Account
     */
    lifecycleStage: LifecycleStage;
    /**
     * 
     * @type {string}
     * @memberof Account
     */
    website: string | null;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    remoteCreatedAt?: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    remoteUpdatedAt?: Date | null;
    /**
     * 
     * @type {boolean}
     * @memberof Account
     */
    remoteWasDeleted?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof Account
     */
    lastModifiedAt?: Date;
}
