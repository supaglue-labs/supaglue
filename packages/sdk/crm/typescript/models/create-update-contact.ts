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
import { Addresses } from './addresses';
import { CustomFields } from './custom-fields';
import { EmailAddresses } from './email-addresses';
import { PhoneNumbers } from './phone-numbers';
/**
 * 
 * @export
 * @interface CreateUpdateContact
 */
export interface CreateUpdateContact {
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateContact
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateContact
     */
    lastName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateContact
     */
    accountId?: string | null;
    /**
     * 
     * @type {Addresses}
     * @memberof CreateUpdateContact
     */
    addresses?: Addresses;
    /**
     * 
     * @type {EmailAddresses}
     * @memberof CreateUpdateContact
     */
    emailAddresses?: EmailAddresses;
    /**
     * 
     * @type {PhoneNumbers}
     * @memberof CreateUpdateContact
     */
    phoneNumbers?: PhoneNumbers;
    /**
     * 
     * @type {string}
     * @memberof CreateUpdateContact
     */
    ownerId?: string | null;
    /**
     * 
     * @type {CustomFields}
     * @memberof CreateUpdateContact
     */
    customFields?: CustomFields;
}
