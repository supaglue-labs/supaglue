/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { TestEnvironment } = require('jest-environment-node');
const { createSupaglueClient } = require('@supaglue/schemas');
const { ProxyAgent, setGlobalDispatcher } = require('undici');

// global-agent and undici are used for proxying http requests for debugging purposes
require('global-agent/bootstrap');
if (process.env['GLOBAL_AGENT_HTTP_PROXY']) {
  setGlobalDispatcher(new ProxyAgent(process.env['GLOBAL_AGENT_HTTP_PROXY']));
}

const toHubspotPluralObjectName = {
  contact: 'contacts',
  account: 'companies',
  opportunity: 'deals',
  PermanentCustomObject: 'PermanentCustomObject',
};

const toPipedriveObjectName = {
  contact: 'persons',
  account: 'organizations',
  lead: 'leads',
  opportunity: 'deals',
  user: 'users',
};

const toOutreachObjectName = {
  contact: 'prospects',
  account: 'accounts',
  sequence: 'sequences',
};

const toSalesloftObjectName = {
  contact: 'people',
  account: 'accounts',
  sequence: 'cadences',
};

const getDeletePassthroughRequest = (id, objectName, providerName) => {
  switch (providerName) {
    case 'salesforce':
      if (objectName === 'custom_object') {
        return {
          method: 'DELETE',
          path: `/services/data/v57.0/tooling/sobjects/CustomObject/${id}`,
        };
      }
      if (objectName === 'PermanentCustomObject') {
        objectName = `PermanentCustomObject__c`;
      }
      return {
        method: 'DELETE',
        path: `/services/data/v57.0/sobjects/${objectName}/${id}`,
      };
    case 'hubspot':
      if (objectName === 'custom_object') {
        return {
          method: 'DELETE',
          path: `/crm/v3/schemas/${id}`,
        };
      }
      return {
        method: 'DELETE',
        path: `/crm/v3/objects/${toHubspotPluralObjectName[objectName]}/${id}`,
      };
    case 'pipedrive':
      return {
        method: 'DELETE',
        path: `/v1/${toPipedriveObjectName[objectName]}/${id}`,
      };
    case 'outreach':
      return {
        method: 'DELETE',
        path: `/api/v2/${toOutreachObjectName[objectName]}/${id}`,
      };
    case 'salesloft':
      return {
        method: 'DELETE',
        path: `/v2/${toSalesloftObjectName[objectName]}/${id}`,
      };
    default:
      throw new Error('Unsupported provider');
  }
};

class IntegrationEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    if (process.env.TESTING_DATABASE_URL) {
      this.global.db = new Pool(parse(process.env.TESTING_DATABASE_URL));
    }

    this.global.testStartTime = new Date();

    // @note: this should be unifiedApiClient and we should create a separate mgmtApiClient since they use different headers
    this.global.apiClient = axios.create({
      baseURL: process.env.API_URL ?? 'http://localhost:8080',
      timeout: 120000,
      validateStatus: () => true, // don't throw on errors, we will check them in the tests
      headers: {
        'x-customer-id': process.env.CUSTOMER_ID,
        'x-api-key': process.env.API_KEY,
      },
    });

    this.global.supaglueClient = createSupaglueClient({
      apiUrl: process.env.API_URL ?? 'http://localhost:8080/api',
      // TODO: How do we add timeout
      apiKey: process.env.API_KEY,
      customerId: process.env.CUSTOMER_ID,
    });

    this.global.addedObjects = [];
  }

  async teardown() {
    // Clean up added objects
    if (this.global.addedObjects?.length) {
      for (const obj of this.global.addedObjects) {
        // Apollo has no delete API
        if (obj.providerName === 'apollo') {
          continue;
        }
        // TODO: Bring this back once we solve custom object delete permission issue
        // if (obj.objectName === 'custom_object' && obj.providerName === 'salesforce') {
        //   // First get ID based on DeveloperName
        //   const response = await this.global.apiClient.post(
        //     '/actions/v2/passthrough',
        //     {
        //       path: `/services/data/v57.0/tooling/query?q=SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='${obj.id}'`,
        //       method: 'GET',
        //     },
        //     {
        //       headers: {
        //         'x-provider-name': obj.providerName,
        //       },
        //     }
        //   );
        //   obj.id = response.data.body.records[0].Id;
        // }
        await this.global.apiClient.post(
          '/actions/v2/passthrough',
          getDeletePassthroughRequest(obj.id, obj.objectName, obj.providerName),
          {
            headers: {
              'x-provider-name': obj.providerName,
            },
          }
        );
      }
    }
    await this.global.db?.end();
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = IntegrationEnvironment;
