import type { SupaglueClient } from '@supaglue/sdk';
import type { AxiosInstance } from 'axios';

export type AddedObject = {
  id: string;
  providerName: string;
  objectName: string;
};

declare global {
  // eslint-disable-next-line no-var
  var apiClient: AxiosInstance;
  // eslint-disable-next-line no-var
  var supaglueClient: SupaglueClient;
  // eslint-disable-next-line no-var
  var testIf: (condition: boolean, ...args: Parameters<typeof test>) => void;

  // eslint-disable-next-line no-var
  var addedObjects: AddedObject[];

  // eslint-disable-next-line no-var
  var testStartTime: Date;
}

global.testIf = (condition: boolean, ...args: Parameters<typeof test>) =>
  condition ? test(...args) : test.skip(...args);
