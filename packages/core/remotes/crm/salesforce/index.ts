import * as jsforce from 'jsforce';
import { AccountCreateParams, RemoteAccount, RemoteAccountUpdateParams } from '../../../types/account';
import { CRMConnection } from '../../../types/connection';
import { RemoteContact, RemoteContactCreateParams, RemoteContactUpdateParams } from '../../../types/contact';
import { Integration } from '../../../types/integration';
import { RemoteLead, RemoteLeadCreateParams, RemoteLeadUpdateParams } from '../../../types/lead';
import {
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '../../../types/opportunity';
import { CrmRemoteClient } from '../base';
import {
  fromSalesforceAccountToRemoteAccount,
  fromSalesforceContactToRemoteContact,
  fromSalesforceLeadToRemoteLead,
  fromSalesforceOpportunityToRemoteOpportunity,
  toSalesforceAccountCreateParams,
  toSalesforceAccountUpdateParams,
  toSalesforceContactCreateParams,
  toSalesforceContactUpdateParams,
  toSalesforceLeadCreateParams,
  toSalesforceLeadUpdateParams,
  toSalesforceOpportunityCreateParams,
  toSalesforceOpportunityUpdateParams,
} from './mappers';

// TODO: data-drive
const BULK2_POLL_TIMEOUT = 240000; // 4 minutes

const propertiesToFetch = {
  account: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'Industry',
    'Website',
    'NumberOfEmployees',
    // We may not need all of these fields in order to map to common model
    'BillingCity',
    'BillingCountry',
    'BillingPostalCode',
    'BillingState',
    'BillingStreet',
    // We may not need all of these fields in order to map to common model
    'ShippingCity',
    'ShippingCountry',
    'ShippingPostalCode',
    'ShippingState',
    'ShippingStreet',
    'Phone',
    'Fax',
    'LastActivityDate',
    'CreatedDate',
    'LastModifiedDate',
    'IsDeleted',
  ],
  contact: [
    'Id',
    'AccountId',
    'FirstName',
    'LastName',
    'Email',
    'Phone',
    'Fax',
    'HomePhone',
    'MobilePhone',
    'OtherPhone',
    'AssistantPhone',
    'CreatedDate',
    'LastActivityDate',
    // We may not need all of these fields in order to map to common model
    'MailingCity',
    'MailingCountry',
    'MailingPostalCode',
    'MailingState',
    'MailingStreet',
    // We may not need all of these fields in order to map to common model
    'OtherCity',
    'OtherCountry',
    'OtherPostalCode',
    'OtherState',
    'OtherStreet',
    'IsDeleted',
  ],
  opportunity: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'LastActivityDate',
    'Amount',
    'IsClosed',
    'IsDeleted',
    'IsWon',
    'StageName',
    'CloseDate',
    'CreatedDate',
    'LastModifiedDate',
    'AccountId',
  ],
  lead: [
    'Id',
    'OwnerId',
    'Title',
    'FirstName',
    'LastName',
    'ConvertedDate',
    'CreatedDate',
    'LastModifiedDate',
    'ConvertedContactId',
    'ConvertedAccountId',
    'Company',
    'City',
    'State',
    'Street',
    'Country',
    'PostalCode',
    'Phone',
    'Email',
    'IsDeleted',
  ],
};

export class SalesforceClient implements CrmRemoteClient {
  readonly #client: jsforce.Connection;

  public constructor({
    instanceUrl,
    refreshToken,
    clientId,
    clientSecret,
  }: {
    instanceUrl: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.#client = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        loginUrl: 'https://login.salesforce.com',
        clientId,
        clientSecret,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
    });
  }

  public async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    throw new Error('Not implemented');
  }

  public async listAccounts(): Promise<RemoteAccount[]> {
    const soql = `
      SELECT ${propertiesToFetch.account.join(', ')}
      FROM Account
    `;

    const accounts = await this.#client.bulk2.query(soql, { pollTimeout: BULK2_POLL_TIMEOUT });
    return accounts.map(fromSalesforceAccountToRemoteAccount);
  }

  public async getAccount(remoteId: string): Promise<RemoteAccount> {
    const account = await this.#client.retrieve('Account', remoteId);
    return fromSalesforceAccountToRemoteAccount(account);
  }

  public async createAccount(params: AccountCreateParams): Promise<RemoteAccount> {
    const response = await this.#client.create('Account', toSalesforceAccountCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce account');
    }

    return await this.getAccount(response.id);
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    const response = await this.#client.update('Account', toSalesforceAccountUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce account');
    }
    return await this.getAccount(response.id);
  }

  public async listContacts(): Promise<RemoteContact[]> {
    const soql = `
      SELECT ${propertiesToFetch.contact.join(', ')}
      FROM Contact
    `;

    const contacts = await this.#client.bulk2.query(soql, { pollTimeout: BULK2_POLL_TIMEOUT });
    return contacts.map(fromSalesforceContactToRemoteContact);
  }

  public async getContact(remoteId: string): Promise<RemoteContact> {
    const contact = await this.#client.retrieve('Contact', remoteId);
    return fromSalesforceContactToRemoteContact(contact);
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    const response = await this.#client.create('Contact', toSalesforceContactCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce contact');
    }
    return await this.getContact(response.id);
  }

  public async updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact> {
    const response = await this.#client.update('Contact', toSalesforceContactUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce contact');
    }
    return await this.getContact(response.id);
  }

  public async listOpportunities(): Promise<RemoteOpportunity[]> {
    const soql = `
      SELECT ${propertiesToFetch.opportunity.join(', ')}
      FROM Opportunity
    `;

    const opportunities = await this.#client.bulk2.query(soql);
    return opportunities.map(fromSalesforceOpportunityToRemoteOpportunity);
  }

  public async getOpportunity(remoteId: string): Promise<RemoteOpportunity> {
    const contact = await this.#client.retrieve('Opportunity', remoteId);
    return fromSalesforceOpportunityToRemoteOpportunity(contact);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    const response = await this.#client.create('Opportunity', toSalesforceOpportunityCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce opportunity');
    }
    return await this.getOpportunity(response.id);
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    const response = await this.#client.update('Opportunity', toSalesforceOpportunityUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce opportunity');
    }
    return await this.getOpportunity(response.id);
  }

  public async listLeads(): Promise<RemoteLead[]> {
    const soql = `
      SELECT ${propertiesToFetch.lead.join(', ')}
      FROM Lead 
    `;

    const leads = await this.#client.bulk2.query(soql, { pollTimeout: BULK2_POLL_TIMEOUT });
    return leads.map(fromSalesforceLeadToRemoteLead);
  }

  public async getLead(remoteId: string): Promise<RemoteLead> {
    const contact = await this.#client.retrieve('Lead', remoteId);
    return fromSalesforceLeadToRemoteLead(contact);
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    const response = await this.#client.create('Lead', toSalesforceLeadCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce lead');
    }
    return await this.getLead(response.id);
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    const response = await this.#client.update('Lead', toSalesforceLeadUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce lead');
    }
    return await this.getLead(response.id);
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function createSalesforceClient(connection: CRMConnection, integration: Integration): SalesforceClient {
  return new SalesforceClient({
    instanceUrl: connection.credentials.instanceUrl,
    refreshToken: connection.credentials.refreshToken,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
  });
}
