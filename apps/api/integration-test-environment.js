/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { TestEnvironment } = require('jest-environment-node');

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
};

const toSalesloftObjectName = {
  contact: 'people',
  account: 'accounts',
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

    this.global.apiClient = axios.create({
      baseURL: process.env.API_URL ?? 'http://localhost:8080',
      timeout: 120000,
      validateStatus: () => true, // don't throw on errors, we will check them in the tests
      headers: {
        'x-customer-id': process.env.CUSTOMER_ID,
        'x-api-key': process.env.API_KEY,
      },
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
