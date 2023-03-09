import { Client } from '@hubspot/api-client';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedCompanies } from '@hubspot/api-client/lib/codegen/crm/companies';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedContacts } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedDeals } from '@hubspot/api-client/lib/codegen/crm/deals';
import retry from 'async-retry';
import { logger } from '../../../lib';
import { RemoteAccount, RemoteAccountCreateParams, RemoteAccountUpdateParams } from '../../../types/account';
import { CRMConnection } from '../../../types/connection';
import { RemoteContact, RemoteContactCreateParams, RemoteContactUpdateParams } from '../../../types/contact';
import { Integration } from '../../../types/integration';
import { RemoteLead, RemoteLeadCreateParams, RemoteLeadUpdateParams } from '../../../types/lead';
import {
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '../../../types/opportunity';
import { ConnectorAuthConfig, CrmRemoteClient, CrmRemoteClientEventEmitter } from '../base';
import {
  fromHubSpotCompanyToRemoteAccount,
  fromHubSpotContactToRemoteContact,
  fromHubSpotDealToRemoteOpportunity,
  toHubspotAccountCreateParams,
  toHubspotAccountUpdateParams,
  toHubspotContactCreateParams,
  toHubspotContactUpdateParams,
  toHubspotOpportunityCreateParams,
  toHubspotOpportunityUpdateParams,
} from './mappers';

const HUBSPOT_RECORD_LIMIT = 100;

const ASYNC_RETRY_OPTIONS = {
  forever: true,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 60 * 6000,
};

const propertiesToFetch = {
  company: [
    'name',
    'hubspot_owner_id',
    'description',
    'industry',
    'website',
    'numberofemployees',
    'address',
    'address2',
    'city',
    'state',
    'country',
    'zip',
    'phone',
    'notes_last_updated',
    'createddate',
    'hs_lastmodifieddate',
  ],
  contact: [
    'address', // TODO: IP state/zip/country?
    'address2',
    'city',
    'country',
    'createdate',
    'email',
    'fax',
    'firstname',
    'hs_additional_emails',
    'hs_createdate', // TODO: Use this or createdate?
    'hs_is_contact', // TODO: distinguish from "visitor"?
    'hs_lastmodifieddate', // TODO: Use this or lastmodifieddate?
    'hs_whatsapp_phone_number',
    'lastmodifieddate',
    'lastname',
    'mobilephone',
    'phone',
    'state',
    'work_email',
    'zip',
  ],
  deal: [
    'dealname',
    'description',
    'dealstage',
    'amount',
    'hubspot_owner_id',
    'notes_last_updated',
    'closedate',
    'hs_is_closed_won',
    'hs_is_closed',
  ],
};

// TODO: We may need to fetch this from the hubspot schema
const CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 1;
const OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 5;

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class HubSpotClient extends CrmRemoteClientEventEmitter implements CrmRemoteClient {
  readonly #client: Client;
  readonly #credentials: Credentials;

  public constructor(credentials: Credentials) {
    super();
    const { accessToken } = credentials;
    this.#client = new Client({
      accessToken,
      numberOfApiCallRetries: 1,
    });
    this.#credentials = credentials;
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (!this.#credentials.expiresAt || Date.parse(this.#credentials.expiresAt) < Date.now() + 300000) {
      const token = await this.#client.oauth.tokensApi.createToken(
        'refresh_token',
        undefined,
        undefined,
        this.#credentials.clientId,
        this.#credentials.clientSecret,
        this.#credentials.refreshToken
      );

      const newAccessToken = token.accessToken;
      const newExpiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.#client.setAccessToken(newAccessToken);
      this.emit('token_refreshed', newAccessToken, newExpiresAt);
    }
  }

  public async listAccounts(): Promise<RemoteAccount[]> {
    let after = undefined;
    const remoteAccounts = [];
    do {
      const currResult: HubspotPaginatedDeals = await this.listAccountsImpl(after);
      after = currResult.paging?.next?.after;
      remoteAccounts.push(...currResult.results.map(fromHubSpotCompanyToRemoteAccount));
    } while (after);
    return remoteAccounts;
  }

  private async listAccountsImpl(after?: string): Promise<HubspotPaginatedCompanies> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const companies = await this.#client.crm.companies.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.company
        );
        return companies;
      } catch (e: any) {
        logger.error(`Error encountered: ${e}`);
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  public async createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
    });
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotCompanyToRemoteAccount(company);
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.update(params.remoteId, {
      properties: toHubspotAccountUpdateParams(params),
    });
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotCompanyToRemoteAccount(company);
  }

  public async listOpportunities(): Promise<RemoteOpportunity[]> {
    let after = undefined;
    const remoteOpportunities = [];
    do {
      const currResult: HubspotPaginatedDeals = await this.listOpportunitiesImpl(after);
      after = currResult.paging?.next?.after;
      remoteOpportunities.push(...currResult.results.map(fromHubSpotDealToRemoteOpportunity));
    } while (after);
    return remoteOpportunities;
  }

  private async listOpportunitiesImpl(after?: string): Promise<HubspotPaginatedDeals> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const deals = await this.#client.crm.deals.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.deal,
          /* propertiesWithHistory */ undefined,
          /* associations */ ['company']
        );
        return deals;
      } catch (e: any) {
        logger.error(`Error encountered: ${e}`);
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.create({
      properties: toHubspotOpportunityCreateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotDealToRemoteOpportunity(deal);
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.update(params.remoteId, {
      properties: toHubspotOpportunityUpdateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotDealToRemoteOpportunity(deal);
  }

  public async listContacts(): Promise<RemoteContact[]> {
    let after = undefined;
    const remoteContacts = [];
    do {
      const currResult: HubspotPaginatedContacts = await this.listContactsImpl(after);
      after = currResult.paging?.next?.after;
      remoteContacts.push(...currResult.results.map(fromHubSpotContactToRemoteContact));
    } while (after);
    return remoteContacts;
  }

  private async listContactsImpl(after?: string): Promise<HubspotPaginatedContacts> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const contacts = await this.#client.crm.contacts.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.contact,
          /* propertiesWithHistory */ undefined,
          /* associations */ ['company']
        );
        return contacts;
      } catch (e: any) {
        logger.error(`Error encountered: ${e}`);
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.create({
      properties: toHubspotContactCreateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.contacts.associationsApi.create(
        parseInt(contact.id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotContactToRemoteContact(contact);
  }

  public async updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.update(params.remoteId, {
      properties: toHubspotContactUpdateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.contacts.associationsApi.create(
        parseInt(contact.id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotContactToRemoteContact(contact);
  }

  public async listLeads(limit?: number): Promise<RemoteLead[]> {
    return [];
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnection, integration: Integration): HubSpotClient {
  return new HubSpotClient({
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.hubapi.com',
  tokenPath: '/oauth/v1/token',
  authorizeHost: 'https://app.hubspot.com',
  authorizePath: '/oauth/authorize',
};
