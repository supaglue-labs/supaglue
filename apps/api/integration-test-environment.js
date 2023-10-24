/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { TestEnvironment } = require('jest-environment-node');

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
  }

  async teardown() {
    await this.global.db?.end();
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = IntegrationEnvironment;
