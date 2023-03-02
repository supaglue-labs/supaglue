import { Client } from '@hubspot/api-client';
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
import { ConnectorAuthConfig, CrmRemoteClient } from '../base';
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
  clientId: string;
  clientSecret: string;
};

class HubSpotClient implements CrmRemoteClient {
  readonly #client: Client;
  readonly #credentials: Credentials;

  public constructor(credentials: Credentials) {
    const { accessToken } = credentials;
    this.#client = new Client({
      accessToken,
      numberOfApiCallRetries: 1,
    });
    this.#credentials = credentials;
  }

  public async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    const token = await this.#client.oauth.tokensApi.createToken(
      'refresh_token',
      undefined,
      undefined,
      this.#credentials.clientId,
      this.#credentials.clientSecret,
      this.#credentials.refreshToken
    );

    this.#client.setAccessToken(token.accessToken);

    return token;
  }

  public async listAccounts(limit?: number): Promise<RemoteAccount[]> {
    const companies = await this.#client.crm.companies.getAll(
      limit,
      /* after */ undefined,
      /* properties */ propertiesToFetch.company
    );
    return companies.map(fromHubSpotCompanyToRemoteAccount);
  }

  public async createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount> {
    const company = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
    });
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotCompanyToRemoteAccount(company);
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    const company = await this.#client.crm.companies.basicApi.update(params.remoteId, {
      properties: toHubspotAccountUpdateParams(params),
    });
    // TODO: when we support associations on creates/updates, we should fetch
    // for associations. The current returned object doesn't have associations.
    return fromHubSpotCompanyToRemoteAccount(company);
  }

  public async listOpportunities(limit?: number): Promise<RemoteOpportunity[]> {
    const deals = await this.#client.crm.deals.getAll(
      limit,
      /* after */ undefined,
      /* properties */ propertiesToFetch.deal,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return deals.map(fromHubSpotDealToRemoteOpportunity);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
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

  public async listContacts(limit?: number): Promise<RemoteContact[]> {
    const contacts = await this.#client.crm.contacts.getAll(
      limit,
      /* after */ undefined,
      propertiesToFetch.contact,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return contacts.map(fromHubSpotContactToRemoteContact);
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
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
