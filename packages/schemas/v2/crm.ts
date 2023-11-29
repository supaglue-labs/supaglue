import type { operations, paths } from '../gen/v2/crm';

export type CreateAccountPathParams = never;
export type CreateAccountQueryParams = never;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse = operations['createAccount']['responses'][201]['content']['application/json'];

export type UpsertAccountPathParams = never;
export type UpsertAccountQueryParams = never;
export type UpsertAccountRequest = operations['upsertAccount']['requestBody']['content']['application/json'];
export type UpsertAccountResponse = operations['upsertAccount']['responses'][201]['content']['application/json'];

export type ListAccountsPathParams = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsRequest = never;
export type ListAccountsResponse = operations['listAccounts']['responses'][200]['content']['application/json'];

export type GetAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountRequest = never;
export type GetAccountResponse = operations['getAccount']['responses'][200]['content']['application/json'];

export type UpdateAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type UpdateAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse = operations['updateAccount']['responses'][200]['content']['application/json'];

export type CreateContactPathParams = never;
export type CreateContactQueryParams = never;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse = operations['createContact']['responses'][201]['content']['application/json'];

export type UpsertContactPathParams = never;
export type UpsertContactQueryParams = never;
export type UpsertContactRequest = operations['upsertContact']['requestBody']['content']['application/json'];
export type UpsertContactResponse = operations['upsertContact']['responses'][201]['content']['application/json'];

export type SearchContactsPathParams = never;
export type SearchContactsQueryParams = Required<operations['searchContacts']>['parameters']['query'];
export type SearchContactsRequest = operations['searchContacts']['requestBody']['content']['application/json'];
export type SearchContactsResponse = operations['searchContacts']['responses'][200]['content']['application/json'];

export type ListContactsPathParams = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsRequest = never;
export type ListContactsResponse = operations['listContacts']['responses'][200]['content']['application/json'];

export type GetContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactRequest = never;
export type GetContactResponse = operations['getContact']['responses'][200]['content']['application/json'];

export type UpdateContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type UpdateContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse = operations['updateContact']['responses'][200]['content']['application/json'];

export type CreateLeadPathParams = never;
export type CreateLeadQueryParams = never;
export type CreateLeadRequest = operations['createLead']['requestBody']['content']['application/json'];
export type CreateLeadResponse = operations['createLead']['responses'][201]['content']['application/json'];

export type GetLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type GetLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type GetLeadRequest = never;
export type GetLeadResponse = operations['getLead']['responses'][200]['content']['application/json'];

export type ListLeadsPathParams = never;
export type ListLeadsQueryParams = Required<operations['listLeads']>['parameters']['query'];
export type ListLeadsRequest = never;
export type ListLeadsResponse = operations['listLeads']['responses'][200]['content']['application/json'];

export type UpdateLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type UpdateLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type UpdateLeadRequest = operations['updateLead']['requestBody']['content']['application/json'];
export type UpdateLeadResponse = operations['updateLead']['responses'][200]['content']['application/json'];

export type UpsertLeadPathParams = never;
export type UpsertLeadQueryParams = never;
export type UpsertLeadRequest = operations['upsertLead']['requestBody']['content']['application/json'];
export type UpsertLeadResponse = operations['upsertLead']['responses'][201]['content']['application/json'];

export type SearchLeadsPathParams = never;
export type SearchLeadsQueryParams = Required<operations['searchLeads']>['parameters']['query'];
export type SearchLeadsRequest = operations['searchLeads']['requestBody']['content']['application/json'];
export type SearchLeadsResponse = operations['searchLeads']['responses'][200]['content']['application/json'];

export type CreateOpportunityPathParams = never;
export type CreateOpportunityQueryParams = any;
export type CreateOpportunityRequest = operations['createOpportunity']['requestBody']['content']['application/json'];
export type CreateOpportunityResponse =
  operations['createOpportunity']['responses'][201]['content']['application/json'];

export type GetOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type GetOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type GetOpportunityRequest = never;
export type GetOpportunityResponse = operations['getOpportunity']['responses'][200]['content']['application/json'];

export type ListOpportunitiesPathParams = never;
export type ListOpportunitiesQueryParams = Required<operations['listOpportunities']>['parameters']['query'];
export type ListOpportunitiesRequest = never;
export type ListOpportunitiesResponse =
  operations['listOpportunities']['responses'][200]['content']['application/json'];

export type UpdateOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type UpdateOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type UpdateOpportunityRequest = operations['updateOpportunity']['requestBody']['content']['application/json'];
export type UpdateOpportunityResponse =
  operations['updateOpportunity']['responses'][200]['content']['application/json'];

export type GetUserPathParams = paths['/users/{user_id}']['parameters']['path'];
export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserRequest = never;
export type GetUserResponse = operations['getUser']['responses'][200]['content']['application/json'];

export type ListUsersPathParams = never;
export type ListUsersQueryParams = Required<operations['listUsers']>['parameters']['query'];
export type ListUsersRequest = never;
export type ListUsersResponse = operations['listUsers']['responses'][200]['content']['application/json'];

export type ListListsPathParams = never;
export type ListListsQueryParams = Required<operations['listLists']>['parameters']['query'];
export type ListListsRequest = never;
export type ListListsResponse = operations['listLists']['responses'][200]['content']['application/json'];

export type GetListMembershipPathParams = paths['/lists/{list_id}']['parameters']['path'];
export type GetListMembershipQueryParams = Required<operations['listListMemberships']>['parameters']['query'];
export type GetListMembershipRequest = never;
export type GetListMembershipResponse =
  operations['listListMemberships']['responses'][200]['content']['application/json'];

export type ListCustomObjectSchemasPathParams = never;
export type ListCustomObjectSchemasQueryParams = never;
export type ListCustomObjectSchemasRequest = never;
export type ListCustomObjectSchemasResponse =
  operations['listCustomObjectSchemas']['responses'][200]['content']['application/json'];

export type CreateCustomObjectSchemaPathParams = never;
export type CreateCustomObjectSchemaQueryParams = never;
export type CreateCustomObjectSchemaRequest =
  operations['createCustomObjectSchema']['requestBody']['content']['application/json'];
export type CreateCustomObjectSchemaResponse =
  operations['createCustomObjectSchema']['responses'][201]['content']['application/json'];

export type GetCustomObjectSchemaPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type GetCustomObjectSchemaQueryParams = never;
export type GetCustomObjectSchemaRequest = never;
export type GetCustomObjectSchemaResponse =
  operations['getCustomObjectSchema']['responses'][200]['content']['application/json'];

export type UpdateCustomObjectSchemaPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type UpdateCustomObjectSchemaQueryParams = never;
export type UpdateCustomObjectSchemaRequest =
  operations['updateCustomObjectSchema']['requestBody']['content']['application/json'];
export type UpdateCustomObjectSchemaResponse =
  operations['updateCustomObjectSchema']['responses'][200]['content']['application/json'];

export type ListAssociationSchemasPathParams = never;
export type ListAssociationSchemasQueryParams = Required<
  Required<operations['listAssociationSchemas']>['parameters']
>['query'];
export type ListAssociationSchemasRequest = never;
export type ListAssociationSchemasResponse =
  operations['listAssociationSchemas']['responses'][200]['content']['application/json'];

export type CreateAssociationSchemaPathParams = never;
export type CreateAssociationSchemaQueryParams = never;
export type CreateAssociationSchemaRequest =
  operations['createAssociationSchema']['requestBody']['content']['application/json'];
export type CreateAssociationSchemaResponse =
  operations['createAssociationSchema']['responses'][201]['content']['application/json'];

export type CreateCustomObjectRecordPathParams = paths['/custom_objects/{object_name}/records']['parameters']['path'];
export type CreateCustomObjectRecordQueryParams = never;
export type CreateCustomObjectRecordRequest =
  operations['createCustomObjectRecord']['requestBody']['content']['application/json'];
export type CreateCustomObjectRecordResponse =
  operations['createCustomObjectRecord']['responses'][201]['content']['application/json'];

export type ListCustomObjectRecordsPathParams = paths['/custom_objects/{object_name}/records']['parameters']['path'];
export type ListCustomObjectRecordsQueryParams = Required<operations['listCustomObjectRecords']>['parameters']['query'];
export type ListCustomObjectRecordsRequest = never;
export type ListCustomObjectRecordsResponse =
  operations['listCustomObjectRecords']['responses'][200]['content']['application/json'];

export type GetCustomObjectRecordPathParams =
  paths['/custom_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type GetCustomObjectRecordQueryParams = never;
export type GetCustomObjectRecordRequest = never;
export type GetCustomObjectRecordResponse =
  operations['getCustomObjectRecord']['responses'][200]['content']['application/json'];

export type UpdateCustomObjectRecordPathParams =
  paths['/custom_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type UpdateCustomObjectRecordQueryParams = never;
export type UpdateCustomObjectRecordRequest =
  operations['updateCustomObjectRecord']['requestBody']['content']['application/json'];
export type UpdateCustomObjectRecordResponse =
  operations['updateCustomObjectRecord']['responses'][200]['content']['application/json'];

export type CreateStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records']['parameters']['path'];
export type CreateStandardObjectRecordQueryParams = never;
export type CreateStandardObjectRecordRequest =
  operations['createStandardObjectRecord']['requestBody']['content']['application/json'];
export type CreateStandardObjectRecordResponse =
  operations['createStandardObjectRecord']['responses'][201]['content']['application/json'];

export type ListStandardObjectRecordsPathParams =
  paths['/standard_objects/{object_name}/records']['parameters']['path'];
export type ListStandardObjectRecordsQueryParams = Required<
  operations['listStandardObjectRecords']
>['parameters']['query'];
export type ListStandardObjectRecordsRequest = never;
export type ListStandardObjectRecordsResponse =
  operations['listStandardObjectRecords']['responses'][200]['content']['application/json'];

export type GetStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type GetStandardObjectRecordQueryParams = never;
export type GetStandardObjectRecordRequest = never;
export type GetStandardObjectRecordResponse =
  operations['getStandardObjectRecord']['responses'][200]['content']['application/json'];

export type UpdateStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type UpdateStandardObjectRecordQueryParams = never;
export type UpdateStandardObjectRecordRequest =
  operations['updateStandardObjectRecord']['requestBody']['content']['application/json'];
export type UpdateStandardObjectRecordResponse =
  operations['updateStandardObjectRecord']['responses'][201]['content']['application/json'];

export type ListAssociationsPathParams = never;
export type ListAssociationsQueryParams = Required<operations['listAssociations']>['parameters']['query'];
export type ListAssociationsRequest = never;
export type ListAssociationsResponse = operations['listAssociations']['responses'][200]['content']['application/json'];

export type UpsertAssociationPathParams = never;
export type UpsertAssociationQueryParams = never;
export type UpsertAssociationRequest = operations['upsertAssociation']['requestBody']['content']['application/json'];
export type UpsertAssociationResponse =
  operations['upsertAssociation']['responses'][201]['content']['application/json'];

export type ListPropertiesPathParams = Required<operations['listPropertiesPreview']>['parameters']['path'];
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = never;
export type ListPropertiesResponse =
  operations['listPropertiesPreview']['responses'][200]['content']['application/json'];

export type GetPropertiesPathParams = Required<operations['getProperty']>['parameters']['path'];
export type GetPropertiesRequest = never;
export type GetPropertiesQueryParams = never;
export type GetPropertiesResponse = operations['getProperty']['responses'][200]['content']['application/json'];

export type CreatePropertiesPathParams = Required<operations['createProperty']>['parameters']['path'];
export type CreatePropertiesRequest = Required<
  operations['createProperty']
>['requestBody']['content']['application/json'];
export type CreatePropertiesQueryParams = never;
export type CreatePropertiesResponse = operations['createProperty']['responses'][200]['content']['application/json'];

export type UpdatePropertiesPathParams = Required<operations['updateProperty']>['parameters']['path'];
export type UpdatePropertiesRequest = Required<
  operations['updateProperty']
>['requestBody']['content']['application/json'];
export type UpdatePropertiesQueryParams = never;
export type UpdatePropertiesResponse = operations['updateProperty']['responses'][200]['content']['application/json'];

export type RegisterPropertiesPathParams = Required<operations['registerProperty']>['parameters']['path'];
export type RegisterPropertiesRequest = Required<
  operations['registerProperty']
>['requestBody']['content']['application/json'];
export type RegisterPropertiesQueryParams = never;
export type RegisterPropertiesResponse =
  operations['registerProperty']['responses'][200]['content']['application/json'];

export type ListStandardObjectSchemasPathParams = never;
export type ListStandardObjectSchemasQueryParams = never;
export type ListStandardObjectSchemasRequest = never;
export type ListStandardObjectSchemasResponse =
  operations['listStandardObjectSchemas']['responses'][200]['content']['application/json'];
