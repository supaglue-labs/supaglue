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
import { Account } from './account';
import { Addresses } from './addresses';
import { Contact } from './contact';
import { EmailAddresses } from './email-addresses';
import { PhoneNumbers } from './phone-numbers';
import { User } from './user';
/**
 * 
 * @export
 * @interface Lead
 */
export interface Lead {
    /**
     * 
     * @type {Addresses}
     * @memberof Lead
     */
    addresses: Addresses;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    company: string | null;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    convertedAccountId: string | null;
    /**
     * 
     * @type {Account}
     * @memberof Lead
     */
    convertedAccount?: Account;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    convertedContactId: string | null;
    /**
     * 
     * @type {Contact}
     * @memberof Lead
     */
    convertedContact?: Contact;
    /**
     * 
     * @type {Date}
     * @memberof Lead
     */
    convertedDate: Date | null;
    /**
     * 
     * @type {EmailAddresses}
     * @memberof Lead
     */
    emailAddresses?: EmailAddresses;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    remoteId: string;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    lastName: string | null;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    leadSource: string | null;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    ownerId: string | null;
    /**
     * 
     * @type {User}
     * @memberof Lead
     */
    owner?: User;
    /**
     * 
     * @type {PhoneNumbers}
     * @memberof Lead
     */
    phoneNumbers: PhoneNumbers;
    /**
     * 
     * @type {string}
     * @memberof Lead
     */
    title: string | null;
    /**
     * 
     * @type {Date}
     * @memberof Lead
     */
    remoteCreatedAt?: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof Lead
     */
    remoteUpdatedAt?: Date | null;
    /**
     * 
     * @type {boolean}
     * @memberof Lead
     */
    remoteWasDeleted?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof Lead
     */
    lastModifiedAt?: Date;
}
