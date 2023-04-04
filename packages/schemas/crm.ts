import type { operations, paths } from './gen/crm';

export type GetAccountsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetAccountsQueryParams = Required<operations['getAccounts']>['parameters']['query'];
export type GetAccountsQueryParams = any;
export type GetAccountsRequest = never;
export type GetAccountsResponse =
  operations['getAccounts']['responses'][keyof operations['getAccounts']['responses']]['content']['application/json'];

export type CreateAccountPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateAccountQueryParams = Required<operations['createAccount']>['parameters']['query'];
export type CreateAccountQueryParams = any;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse =
  operations['createAccount']['responses'][keyof operations['createAccount']['responses']]['content']['application/json'];

export type GetAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountQueryParams = any;
export type GetAccountRequest = never;
export type GetAccountResponse =
  operations['getAccount']['responses'][keyof operations['getAccount']['responses']]['content']['application/json'];

export type UpdateAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type UpdateAccountQueryParams = any;
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse =
  operations['updateAccount']['responses'][keyof operations['updateAccount']['responses']]['content']['application/json'];

export type SearchAccountsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type SearchAccountsQueryParams = Required<operations['searchAccounts']>['parameters']['query'];
export type SearchAccountsQueryParams = any;
export type SearchAccountsRequest = operations['searchAccounts']['requestBody']['content']['application/json'];
export type SearchAccountsResponse =
  operations['searchAccounts']['responses'][keyof operations['searchAccounts']['responses']]['content']['application/json'];

export type GetContactsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetContactsQueryParams = Required<operations['getContacts']>['parameters']['query'];
export type GetContactsQueryParams = any;
export type GetContactsRequest = never;
export type GetContactsResponse =
  operations['getContacts']['responses'][keyof operations['getContacts']['responses']]['content']['application/json'];

export type CreateContactPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateContactQueryParams = Required<operations['createContact']>['parameters']['query'];
export type CreateContactQueryParams = any;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];

export type GetContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactQueryParams = any;
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];

export type UpdateContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type UpdateContactQueryParams = any;
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];

export type SearchContactsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type SearchContactsQueryParams = Required<operations['searchContacts']>['parameters']['query'];
export type SearchContactsQueryParams = any;
export type SearchContactsRequest = operations['searchContacts']['requestBody']['content']['application/json'];
export type SearchContactsResponse =
  operations['searchContacts']['responses'][keyof operations['searchContacts']['responses']]['content']['application/json'];

export type GetLeadsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetLeadsQueryParams = Required<operations['getLeads']>['parameters']['query'];
export type GetLeadsQueryParams = any;
export type GetLeadsRequest = never;
export type GetLeadsResponse =
  operations['getLeads']['responses'][keyof operations['getLeads']['responses']]['content']['application/json'];

export type CreateLeadPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateLeadQueryParams = Required<operations['createLead']>['parameters']['query'];
export type CreateLeadQueryParams = any;
export type CreateLeadRequest = operations['createLead']['requestBody']['content']['application/json'];
export type CreateLeadResponse =
  operations['createLead']['responses'][keyof operations['createLead']['responses']]['content']['application/json'];

export type GetLeadPathParams = paths[`/leads/{lead_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type GetLeadQueryParams = any;
export type GetLeadRequest = never;
export type GetLeadResponse =
  operations['getLead']['responses'][keyof operations['getLead']['responses']]['content']['application/json'];

export type UpdateLeadPathParams = paths[`/leads/{lead_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type UpdateLeadQueryParams = any;
export type UpdateLeadRequest = operations['updateLead']['requestBody']['content']['application/json'];
export type UpdateLeadResponse =
  operations['updateLead']['responses'][keyof operations['updateLead']['responses']]['content']['application/json'];

export type GetOpportunitiesPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetOpportunitiesQueryParams = Required<operations['getOpportunities']>['parameters']['query'];
export type GetOpportunitiesQueryParams = any;
export type GetOpportunitiesRequest = never;
export type GetOpportunitiesResponse =
  operations['getOpportunities']['responses'][keyof operations['getOpportunities']['responses']]['content']['application/json'];

export type CreateOpportunityPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateOpportunityQueryParams = Required<operations['createOpportunity']>['parameters']['query'];
export type CreateOpportunityQueryParams = any;
export type CreateOpportunityRequest = operations['createOpportunity']['requestBody']['content']['application/json'];
export type CreateOpportunityResponse =
  operations['createOpportunity']['responses'][keyof operations['createOpportunity']['responses']]['content']['application/json'];

export type GetOpportunityPathParams = paths[`/opportunities/{opportunity_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type GetOpportunityQueryParams = any;
export type GetOpportunityRequest = never;
export type GetOpportunityResponse =
  operations['getOpportunity']['responses'][keyof operations['getOpportunity']['responses']]['content']['application/json'];

export type UpdateOpportunityPathParams = paths[`/opportunities/{opportunity_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type UpdateOpportunityQueryParams = any;
export type UpdateOpportunityRequest = operations['updateOpportunity']['requestBody']['content']['application/json'];
export type UpdateOpportunityResponse =
  operations['updateOpportunity']['responses'][keyof operations['updateOpportunity']['responses']]['content']['application/json'];

export type SearchOpportunitiesPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type SearchOpportunitiesQueryParams = Required<operations['searchOpportunities']>['parameters']['query'];
export type SearchOpportunitiesQueryParams = any;
export type SearchOpportunitiesRequest =
  operations['searchOpportunities']['requestBody']['content']['application/json'];
export type SearchOpportunitiesResponse =
  operations['searchOpportunities']['responses'][keyof operations['searchOpportunities']['responses']]['content']['application/json'];

export type GetUsersPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetUsersQueryParams = Required<operations['getUsers']>['parameters']['query'];
export type GetUsersQueryParams = any;
export type GetUsersRequest = never;
export type GetUsersResponse =
  operations['getUsers']['responses'][keyof operations['getUsers']['responses']]['content']['application/json'];

export type GetUserPathParams = paths[`/users/{user_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserQueryParams = any;
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];

export type GetEventsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetEventsQueryParams = Required<operations['getEvents']>['parameters']['query'];
export type GetEventsQueryParams = any;
export type GetEventsRequest = never;
export type GetEventsResponse =
  operations['getEvents']['responses'][keyof operations['getEvents']['responses']]['content']['application/json'];

export type CreateEventPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateEventQueryParams = Required<operations['createEvent']>['parameters']['query'];
export type CreateEventQueryParams = any;
export type CreateEventRequest = operations['createEvent']['requestBody']['content']['application/json'];
export type CreateEventResponse =
  operations['createEvent']['responses'][keyof operations['createEvent']['responses']]['content']['application/json'];

export type GetEventPathParams = paths[`/events/{event_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetEventQueryParams = Required<operations['getEvent']>['parameters']['query'];
export type GetEventQueryParams = any;
export type GetEventRequest = never;
export type GetEventResponse =
  operations['getEvent']['responses'][keyof operations['getEvent']['responses']]['content']['application/json'];

export type UpdateEventPathParams = paths[`/events/{event_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateEventQueryParams = Required<operations['getEvent']>['parameters']['query'];
export type UpdateEventQueryParams = any;
export type UpdateEventRequest = operations['updateEvent']['requestBody']['content']['application/json'];
export type UpdateEventResponse =
  operations['updateEvent']['responses'][keyof operations['updateEvent']['responses']]['content']['application/json'];

export type SendPassthroughRequestPathParams = any;
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type SendPassthroughRequestQueryParams = Required<operations['getUser']>['parameters']['query'];
export type SendPassthroughRequestQueryParams = any;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];
