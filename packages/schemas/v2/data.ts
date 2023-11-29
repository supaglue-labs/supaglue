import type { operations } from '../gen/v2/data';

//
// Hubspot
//

export type ListHubspotCompaniesPathParams = never;
export type ListHubspotCompaniesRequest = never;
export type ListHubspotCompaniesQueryParams = Required<operations['listHubspotCompanies']>['parameters']['query'];
export type ListHubspotCompaniesResponse =
  operations['listHubspotCompanies']['responses'][keyof operations['listHubspotCompanies']['responses']]['content']['application/json'];

export type ListHubspotContactsPathParams = never;
export type ListHubspotContactsRequest = never;
export type ListHubspotContactsQueryParams = Required<operations['listHubspotContacts']>['parameters']['query'];
export type ListHubspotContactsResponse =
  operations['listHubspotContacts']['responses'][keyof operations['listHubspotContacts']['responses']]['content']['application/json'];

//
// Salesforce
//

export type ListSalesforceAccountsPathParams = never;
export type ListSalesforceAccountsRequest = never;
export type ListSalesforceAccountsQueryParams = Required<operations['listSalesforceAccounts']>['parameters']['query'];
export type ListSalesforceAccountsResponse =
  operations['listSalesforceAccounts']['responses'][keyof operations['listSalesforceAccounts']['responses']]['content']['application/json'];

export type ListSalesforceContactsPathParams = never;
export type ListSalesforceContactsRequest = never;
export type ListSalesforceContactsQueryParams = Required<operations['listSalesforceContacts']>['parameters']['query'];
export type ListSalesforceContactsResponse =
  operations['listSalesforceContacts']['responses'][keyof operations['listSalesforceContacts']['responses']]['content']['application/json'];
