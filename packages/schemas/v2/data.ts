import type { operations } from '../gen/v2/data';

export type ListAccountsPathParams = never;
export type ListAccountsRequest = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsResponse =
  operations['listAccounts']['responses'][keyof operations['listAccounts']['responses']]['content']['application/json'];

export type ListContactsPathParams = never;
export type ListContactsRequest = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsResponse =
  operations['listContacts']['responses'][keyof operations['listContacts']['responses']]['content']['application/json'];
