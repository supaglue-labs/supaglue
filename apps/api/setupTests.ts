import type { AxiosInstance } from 'axios';
import axios from 'axios';

declare global {
  // eslint-disable-next-line no-var
  var apiClient: AxiosInstance;
  // eslint-disable-next-line no-var
  var testIf: (condition: boolean, ...args: any[]) => void;
}

const testIf = (condition: boolean, ...args: Parameters<typeof test>) =>
  condition ? test(...args) : test.skip(...args);

const client = axios.create({
  baseURL: process.env.API_URL ?? 'http://localhost:8080',
  timeout: 20000,
  validateStatus: () => true, // don't throw on errors, we will check them in the tests
  headers: {
    'x-customer-id': process.env.CUSTOMER_ID,
    'x-api-key': process.env.API_KEY,
  },
});

global.apiClient = client;
global.testIf = testIf;
