import type { AxiosInstance } from 'axios';
import axios from 'axios';

declare global {
  // eslint-disable-next-line no-var
  var apiClient: AxiosInstance;
}

const client = axios.create({
  baseURL: process.env.API_URL,
  timeout: 1000,
  headers: {
    'x-customer-id': process.env.CUSTOMER_ID,
    'x-api-key': process.env.API_KEY,
  },
});

global.apiClient = client;
