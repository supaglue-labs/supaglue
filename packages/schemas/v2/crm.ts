import type { operations, paths } from '../gen/v2/crm';

export type CreateAccountPathParams = never;
export type CreateAccountQueryParams = never;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse =
  operations['createAccount']['responses'][keyof operations['createAccount']['responses']]['content']['application/json'];

export type UpsertAccountPathParams = never;
export type UpsertAccountQueryParams = never;
export type UpsertAccountRequest = operations['upsertAccount']['requestBody']['content']['application/json'];
export type UpsertAccountResponse =
  operations['upsertAccount']['responses'][keyof operations['upsertAccount']['responses']]['content']['application/json'];

export type ListAccountsPathParams = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsRequest = never;
export type ListAccountsResponse =
  operations['listAccounts']['responses'][keyof operations['listAccounts']['responses']]['content']['application/json'];

export type GetAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountRequest = never;
export type GetAccountResponse =
  operations['getAccount']['responses'][keyof operations['getAccount']['responses']]['content']['application/json'];

export type UpdateAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type UpdateAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse =
  operations['updateAccount']['responses'][keyof operations['updateAccount']['responses']]['content']['application/json'];

export type CreateContactPathParams = never;
export type CreateContactQueryParams = never;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];

export type UpsertContactPathParams = never;
export type UpsertContactQueryParams = never;
export type UpsertContactRequest = operations['upsertContact']['requestBody']['content']['application/json'];
export type UpsertContactResponse =
  operations['upsertContact']['responses'][keyof operations['upsertContact']['responses']]['content']['application/json'];

export type SearchContactsPathParams = never;
export type SearchContactsQueryParams = Required<operations['searchContacts']>['parameters']['query'];
export type SearchContactsRequest = operations['searchContacts']['requestBody']['content']['application/json'];
export type SearchContactsResponse =
  operations['searchContacts']['responses'][keyof operations['searchContacts']['responses']]['content']['application/json'];

export type ListContactsPathParams = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsRequest = never;
export type ListContactsResponse =
  operations['listContacts']['responses'][keyof operations['listContacts']['responses']]['content']['application/json'];

export type GetContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];

export type UpdateContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type UpdateContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];

export type CreateLeadPathParams = never;
export type CreateLeadQueryParams = never;
export type CreateLeadRequest = operations['createLead']['requestBody']['content']['application/json'];
export type CreateLeadResponse =
  operations['createLead']['responses'][keyof operations['createLead']['responses']]['content']['application/json'];

export type GetLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type GetLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type GetLeadRequest = never;
export type GetLeadResponse =
  operations['getLead']['responses'][keyof operations['getLead']['responses']]['content']['application/json'];

export type UpdateLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type UpdateLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type UpdateLeadRequest = operations['updateLead']['requestBody']['content']['application/json'];
export type UpdateLeadResponse =
  operations['updateLead']['responses'][keyof operations['updateLead']['responses']]['content']['application/json'];

export type UpsertLeadPathParams = never;
export type UpsertLeadQueryParams = never;
export type UpsertLeadRequest = operations['upsertLead']['requestBody']['content']['application/json'];
export type UpsertLeadResponse =
  operations['upsertLead']['responses'][keyof operations['upsertLead']['responses']]['content']['application/json'];

export type SearchLeadsPathParams = never;
export type SearchLeadsQueryParams = Required<operations['searchLeads']>['parameters']['query'];
export type SearchLeadsRequest = operations['searchLeads']['requestBody']['content']['application/json'];
export type SearchLeadsResponse =
  operations['searchLeads']['responses'][keyof operations['searchLeads']['responses']]['content']['application/json'];

export type CreateOpportunityPathParams = never;
export type CreateOpportunityQueryParams = any;
export type CreateOpportunityRequest = operations['createOpportunity']['requestBody']['content']['application/json'];
export type CreateOpportunityResponse =
  operations['createOpportunity']['responses'][keyof operations['createOpportunity']['responses']]['content']['application/json'];

export type GetOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type GetOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type GetOpportunityRequest = never;
export type GetOpportunityResponse =
  operations['getOpportunity']['responses'][keyof operations['getOpportunity']['responses']]['content']['application/json'];

export type UpdateOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type UpdateOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type UpdateOpportunityRequest = operations['updateOpportunity']['requestBody']['content']['application/json'];
export type UpdateOpportunityResponse =
  operations['updateOpportunity']['responses'][keyof operations['updateOpportunity']['responses']]['content']['application/json'];

export type GetUserPathParams = paths['/users/{user_id}']['parameters']['path'];
export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];

export type SendPassthroughRequestPathParams = never;
export type SendPassthroughRequestQueryParams = never;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];

export type ListListsPathParams = never;
export type ListListsQueryParams = Required<operations['listLists']>['parameters']['query'];
export type ListListsRequest = never;
export type ListListsResponse =
  operations['listLists']['responses'][keyof operations['listLists']['responses']]['content']['application/json'];

export type GetListMembershipPathParams = paths['/lists/{list_id}']['parameters']['path'];
export type GetListMembershipQueryParams = Required<operations['listListMemberships']>['parameters']['query'];
export type GetListMembershipRequest = never;
export type GetListMembershipResponse =
  operations['listListMemberships']['responses'][keyof operations['listListMemberships']['responses']]['content']['application/json'];

export type ListCustomObjectsPathParams = never;
export type ListCustomObjectsQueryParams = never;
export type ListCustomObjectsRequest = never;
export type ListCustomObjectsResponse =
  operations['listCustomObjects']['responses'][keyof operations['listCustomObjects']['responses']]['content']['application/json'];

export type CreateCustomObjectPathParams = never;
export type CreateCustomObjectQueryParams = never;
export type CreateCustomObjectRequest = operations['createCustomObject']['requestBody']['content']['application/json'];
export type CreateCustomObjectResponse =
  operations['createCustomObject']['responses'][keyof operations['createCustomObject']['responses']]['content']['application/json'];

export type GetCustomObjectPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type GetCustomObjectQueryParams = never;
export type GetCustomObjectRequest = never;
export type GetCustomObjectResponse =
  operations['getCustomObject']['responses'][keyof operations['getCustomObject']['responses']]['content']['application/json'];

export type UpdateCustomObjectPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type UpdateCustomObjectQueryParams = never;
export type UpdateCustomObjectRequest = operations['updateCustomObject']['requestBody']['content']['application/json'];
export type UpdateCustomObjectResponse =
  operations['updateCustomObject']['responses'][keyof operations['updateCustomObject']['responses']]['content']['application/json'];

export type GetAssociationSchemasPathParams = never;
export type GetAssociationSchemasQueryParams = Required<
  Required<operations['getAssociationSchemas']>['parameters']
>['query'];
export type GetAssociationSchemasRequest = never;
export type GetAssociationSchemasResponse =
  operations['getAssociationSchemas']['responses'][keyof operations['getAssociationSchemas']['responses']]['content']['application/json'];

export type CreateAssociationSchemaPathParams = never;
export type CreateAssociationSchemaQueryParams = never;
export type CreateAssociationSchemaRequest =
  operations['createAssociationSchema']['requestBody']['content']['application/json'];
export type CreateAssociationSchemaResponse =
  operations['createAssociationSchema']['responses'][keyof operations['createAssociationSchema']['responses']]['content']['application/json'];
