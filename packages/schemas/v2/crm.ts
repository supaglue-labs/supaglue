import type { operations, paths } from '../gen/v2/crm';

export type CreateAccountPathParams = never;
export type CreateAccountQueryParams = never;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse =
  operations['createAccount']['responses'][keyof operations['createAccount']['responses']]['content']['application/json'];
export type CreateAccountSuccessfulResponse =
  operations['createAccount']['responses']['201']['content']['application/json'];
export type SendPassthroughRequestFailureResponse = Exclude<CreateAccountResponse, CreateAccountSuccessfulResponse>;

export type UpsertAccountPathParams = never;
export type UpsertAccountQueryParams = never;
export type UpsertAccountRequest = operations['upsertAccount']['requestBody']['content']['application/json'];
export type UpsertAccountResponse =
  operations['upsertAccount']['responses'][keyof operations['upsertAccount']['responses']]['content']['application/json'];
export type UpsertAccountSuccessfulResponse =
  operations['upsertAccount']['responses']['201']['content']['application/json'];
export type UpsertAccountFailureResponse = Exclude<UpsertAccountResponse, UpsertAccountSuccessfulResponse>;

export type ListAccountsPathParams = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsRequest = never;
export type ListAccountsResponse =
  operations['listAccounts']['responses'][keyof operations['listAccounts']['responses']]['content']['application/json'];
export type ListAccountsSuccessfulResponse =
  operations['listAccounts']['responses']['200']['content']['application/json'];
export type ListAccountsFailureResponse = Exclude<ListAccountsResponse, ListAccountsSuccessfulResponse>;

export type GetAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountRequest = never;
export type GetAccountResponse =
  operations['getAccount']['responses'][keyof operations['getAccount']['responses']]['content']['application/json'];
export type GetAccountSuccessfulResponse = operations['getAccount']['responses']['200']['content']['application/json'];
export type GetAccountFailureResponse = Exclude<GetAccountResponse, GetAccountSuccessfulResponse>;

export type UpdateAccountPathParams = paths['/accounts/{account_id}']['parameters']['path'];
export type UpdateAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse =
  operations['updateAccount']['responses'][keyof operations['updateAccount']['responses']]['content']['application/json'];
export type UpdateAccountSuccessfulResponse =
  operations['updateAccount']['responses']['200']['content']['application/json'];
export type UpdateAccountFailureResponse = Exclude<UpdateAccountResponse, UpdateAccountSuccessfulResponse>;

export type CreateContactPathParams = never;
export type CreateContactQueryParams = never;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];
export type CreateContactSuccessfulResponse =
  operations['createContact']['responses']['201']['content']['application/json'];
export type CreateContactFailureResponse = Exclude<CreateContactResponse, CreateContactSuccessfulResponse>;

export type UpsertContactPathParams = never;
export type UpsertContactQueryParams = never;
export type UpsertContactRequest = operations['upsertContact']['requestBody']['content']['application/json'];
export type UpsertContactResponse =
  operations['upsertContact']['responses'][keyof operations['upsertContact']['responses']]['content']['application/json'];
export type UpsertContactSuccessfulResponse =
  operations['upsertContact']['responses']['201']['content']['application/json'];
export type UpsertContactFailureResponse = Exclude<UpsertContactResponse, UpsertContactSuccessfulResponse>;

export type SearchContactsPathParams = never;
export type SearchContactsQueryParams = Required<operations['searchContacts']>['parameters']['query'];
export type SearchContactsRequest = operations['searchContacts']['requestBody']['content']['application/json'];
export type SearchContactsResponse =
  operations['searchContacts']['responses'][keyof operations['searchContacts']['responses']]['content']['application/json'];
export type SearchContactsSuccessfulResponse =
  operations['searchContacts']['responses']['200']['content']['application/json'];
export type SearchContactsFailureResponse = Exclude<SearchContactsResponse, SearchContactsSuccessfulResponse>;

export type ListContactsPathParams = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsRequest = never;
export type ListContactsResponse =
  operations['listContacts']['responses'][keyof operations['listContacts']['responses']]['content']['application/json'];
export type ListContactsSuccessfulResponse =
  operations['listContacts']['responses']['200']['content']['application/json'];
export type ListContactsFailureResponse = Exclude<ListContactsResponse, ListContactsSuccessfulResponse>;

export type GetContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];
export type GetContactSuccessfulResponse = operations['getContact']['responses']['200']['content']['application/json'];
export type GetContactFailureResponse = Exclude<GetContactResponse, GetContactSuccessfulResponse>;

export type UpdateContactPathParams = paths['/contacts/{contact_id}']['parameters']['path'];
export type UpdateContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];
export type UpdateContactSuccessfulResponse =
  operations['updateContact']['responses']['200']['content']['application/json'];
export type UpdateContactFailureResponse = Exclude<UpdateContactResponse, UpdateContactSuccessfulResponse>;

export type CreateLeadPathParams = never;
export type CreateLeadQueryParams = never;
export type CreateLeadRequest = operations['createLead']['requestBody']['content']['application/json'];
export type CreateLeadResponse =
  operations['createLead']['responses'][keyof operations['createLead']['responses']]['content']['application/json'];
export type CreateLeadSuccessfulResponse = operations['createLead']['responses']['201']['content']['application/json'];
export type CreateLeadFailureResponse = Exclude<CreateLeadResponse, CreateLeadSuccessfulResponse>;

export type GetLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type GetLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type GetLeadRequest = never;
export type GetLeadResponse =
  operations['getLead']['responses'][keyof operations['getLead']['responses']]['content']['application/json'];
export type GetLeadSuccessfulResponse = operations['getLead']['responses']['200']['content']['application/json'];
export type GetLeadFailureResponse = Exclude<GetLeadResponse, GetLeadSuccessfulResponse>;

export type ListLeadsPathParams = never;
export type ListLeadsQueryParams = Required<operations['listLeads']>['parameters']['query'];
export type ListLeadsRequest = never;
export type ListLeadsResponse =
  operations['listLeads']['responses'][keyof operations['listLeads']['responses']]['content']['application/json'];
export type ListLeadsSuccessfulResponse = operations['listLeads']['responses']['200']['content']['application/json'];
export type ListLeadsFailureResponse = Exclude<ListLeadsResponse, ListLeadsSuccessfulResponse>;

export type UpdateLeadPathParams = paths['/leads/{lead_id}']['parameters']['path'];
export type UpdateLeadQueryParams = Required<operations['getLead']>['parameters']['query'];
export type UpdateLeadRequest = operations['updateLead']['requestBody']['content']['application/json'];
export type UpdateLeadResponse =
  operations['updateLead']['responses'][keyof operations['updateLead']['responses']]['content']['application/json'];
export type UpdateLeadSuccessfulResponse = operations['updateLead']['responses']['200']['content']['application/json'];
export type UpdateLeadFailureResponse = Exclude<UpdateLeadResponse, UpdateLeadSuccessfulResponse>;

export type UpsertLeadPathParams = never;
export type UpsertLeadQueryParams = never;
export type UpsertLeadRequest = operations['upsertLead']['requestBody']['content']['application/json'];
export type UpsertLeadResponse =
  operations['upsertLead']['responses'][keyof operations['upsertLead']['responses']]['content']['application/json'];
export type UpsertLeadSuccessfulResponse = operations['upsertLead']['responses']['201']['content']['application/json'];
export type UpsertLeadFailureResponse = Exclude<UpsertLeadResponse, UpsertLeadSuccessfulResponse>;

export type SearchLeadsPathParams = never;
export type SearchLeadsQueryParams = Required<operations['searchLeads']>['parameters']['query'];
export type SearchLeadsRequest = operations['searchLeads']['requestBody']['content']['application/json'];
export type SearchLeadsResponse =
  operations['searchLeads']['responses'][keyof operations['searchLeads']['responses']]['content']['application/json'];
export type SearchLeadsSuccessfulResponse =
  operations['searchLeads']['responses']['200']['content']['application/json'];
export type SearchLeadsFailureResponse = Exclude<SearchLeadsResponse, SearchLeadsSuccessfulResponse>;

export type CreateOpportunityPathParams = never;
export type CreateOpportunityQueryParams = any;
export type CreateOpportunityRequest = operations['createOpportunity']['requestBody']['content']['application/json'];
export type CreateOpportunityResponse =
  operations['createOpportunity']['responses'][keyof operations['createOpportunity']['responses']]['content']['application/json'];
export type CreateOpportunitySuccessfulResponse =
  operations['createOpportunity']['responses']['201']['content']['application/json'];
export type CreateOpportunityFailureResponse = Exclude<CreateOpportunityResponse, CreateOpportunitySuccessfulResponse>;

export type GetOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type GetOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type GetOpportunityRequest = never;
export type GetOpportunityResponse =
  operations['getOpportunity']['responses'][keyof operations['getOpportunity']['responses']]['content']['application/json'];
export type GetOpportunitySuccessfulResponse =
  operations['getOpportunity']['responses']['200']['content']['application/json'];
export type GetOpportunityFailureResponse = Exclude<GetOpportunityResponse, GetOpportunitySuccessfulResponse>;

export type ListOpportunitiesPathParams = never;
export type ListOpportunitiesQueryParams = Required<operations['listOpportunities']>['parameters']['query'];
export type ListOpportunitiesRequest = never;
export type ListOpportunitiesResponse =
  operations['listOpportunities']['responses'][keyof operations['listOpportunities']['responses']]['content']['application/json'];
export type ListOpportunitiesSuccessfulResponse =
  operations['listOpportunities']['responses']['200']['content']['application/json'];
export type ListOpportunitiesFailureResponse = Exclude<ListOpportunitiesResponse, ListOpportunitiesSuccessfulResponse>;

export type UpdateOpportunityPathParams = paths['/opportunities/{opportunity_id}']['parameters']['path'];
export type UpdateOpportunityQueryParams = Required<operations['getOpportunity']>['parameters']['query'];
export type UpdateOpportunityRequest = operations['updateOpportunity']['requestBody']['content']['application/json'];
export type UpdateOpportunityResponse =
  operations['updateOpportunity']['responses'][keyof operations['updateOpportunity']['responses']]['content']['application/json'];
export type UpdateOpportunitySuccessfulResponse =
  operations['updateOpportunity']['responses']['200']['content']['application/json'];
export type UpdateOpportunityFailureResponse = Exclude<UpdateOpportunityResponse, UpdateOpportunitySuccessfulResponse>;

export type GetUserPathParams = paths['/users/{user_id}']['parameters']['path'];
export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];
export type GetUserSuccessfulResponse = operations['getUser']['responses']['200']['content']['application/json'];
export type GetUserFailureResponse = Exclude<GetUserResponse, GetUserSuccessfulResponse>;

export type ListUsersPathParams = never;
export type ListUsersQueryParams = Required<operations['listUsers']>['parameters']['query'];
export type ListUsersRequest = never;
export type ListUsersResponse =
  operations['listUsers']['responses'][keyof operations['listUsers']['responses']]['content']['application/json'];
export type ListUsersSuccessfulResponse = operations['listUsers']['responses']['200']['content']['application/json'];
export type ListUsersFailureResponse = Exclude<ListUsersResponse, ListUsersSuccessfulResponse>;

export type ListListsPathParams = never;
export type ListListsQueryParams = Required<operations['listLists']>['parameters']['query'];
export type ListListsRequest = never;
export type ListListsResponse =
  operations['listLists']['responses'][keyof operations['listLists']['responses']]['content']['application/json'];
export type ListListsSuccessfulResponse = operations['listLists']['responses']['200']['content']['application/json'];
export type ListListsFailureResponse = Exclude<ListListsResponse, ListListsSuccessfulResponse>;

export type GetListMembershipPathParams = paths['/lists/{list_id}']['parameters']['path'];
export type GetListMembershipQueryParams = Required<operations['listListMemberships']>['parameters']['query'];
export type GetListMembershipRequest = never;
export type GetListMembershipResponse =
  operations['listListMemberships']['responses'][keyof operations['listListMemberships']['responses']]['content']['application/json'];
export type GetListMembershipSuccessfulResponse =
  operations['listListMemberships']['responses']['200']['content']['application/json'];
export type GetListMembershipFailureResponse = Exclude<GetListMembershipResponse, GetListMembershipSuccessfulResponse>;

export type ListCustomObjectSchemasPathParams = never;
export type ListCustomObjectSchemasQueryParams = never;
export type ListCustomObjectSchemasRequest = never;
export type ListCustomObjectSchemasResponse =
  operations['listCustomObjectSchemas']['responses'][keyof operations['listCustomObjectSchemas']['responses']]['content']['application/json'];
export type ListCustomObjectSchemasSuccessfulResponse =
  operations['listCustomObjectSchemas']['responses']['200']['content']['application/json'];
export type ListCustomObjectSchemasFailureResponse = Exclude<
  ListCustomObjectSchemasResponse,
  ListCustomObjectSchemasSuccessfulResponse
>;

export type CreateCustomObjectSchemaPathParams = never;
export type CreateCustomObjectSchemaQueryParams = never;
export type CreateCustomObjectSchemaRequest =
  operations['createCustomObjectSchema']['requestBody']['content']['application/json'];
export type CreateCustomObjectSchemaResponse =
  operations['createCustomObjectSchema']['responses'][keyof operations['createCustomObjectSchema']['responses']]['content']['application/json'];
export type CreateCustomObjectSchemaSuccessfulResponse =
  operations['createCustomObjectSchema']['responses']['201']['content']['application/json'];
export type CreateCustomObjectSchemaFailureResponse = Exclude<
  CreateCustomObjectSchemaResponse,
  CreateCustomObjectSchemaSuccessfulResponse
>;

export type GetCustomObjectSchemaPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type GetCustomObjectSchemaQueryParams = never;
export type GetCustomObjectSchemaRequest = never;
export type GetCustomObjectSchemaResponse =
  operations['getCustomObjectSchema']['responses'][keyof operations['getCustomObjectSchema']['responses']]['content']['application/json'];
export type GetCustomObjectSchemaSuccessfulResponse =
  operations['getCustomObjectSchema']['responses']['200']['content']['application/json'];
export type GetCustomObjectSchemaFailureResponse = Exclude<
  GetCustomObjectSchemaResponse,
  GetCustomObjectSchemaSuccessfulResponse
>;

export type UpdateCustomObjectSchemaPathParams = paths[`/metadata/custom_objects/{object_name}`]['parameters']['path'];
export type UpdateCustomObjectSchemaQueryParams = never;
export type UpdateCustomObjectSchemaRequest =
  operations['updateCustomObjectSchema']['requestBody']['content']['application/json'];
export type UpdateCustomObjectSchemaResponse =
  operations['updateCustomObjectSchema']['responses'][keyof operations['updateCustomObjectSchema']['responses']]['content']['application/json'];
export type UpdateCustomObjectSchemaSuccessfulResponse =
  operations['updateCustomObjectSchema']['responses']['200']['content']['application/json'];
export type UpdateCustomObjectSchemaFailureResponse = Exclude<
  UpdateCustomObjectSchemaResponse,
  UpdateCustomObjectSchemaSuccessfulResponse
>;

export type ListAssociationSchemasPathParams = never;
export type ListAssociationSchemasQueryParams = Required<
  Required<operations['listAssociationSchemas']>['parameters']
>['query'];
export type ListAssociationSchemasRequest = never;
export type ListAssociationSchemasResponse =
  operations['listAssociationSchemas']['responses'][keyof operations['listAssociationSchemas']['responses']]['content']['application/json'];
export type ListAssociationSchemasSuccessfulResponse =
  operations['listAssociationSchemas']['responses']['200']['content']['application/json'];
export type ListAssociationSchemasFailureResponse = Exclude<
  ListAssociationSchemasResponse,
  ListAssociationSchemasSuccessfulResponse
>;

export type CreateAssociationSchemaPathParams = never;
export type CreateAssociationSchemaQueryParams = never;
export type CreateAssociationSchemaRequest =
  operations['createAssociationSchema']['requestBody']['content']['application/json'];
export type CreateAssociationSchemaResponse =
  operations['createAssociationSchema']['responses'][keyof operations['createAssociationSchema']['responses']]['content']['application/json'];
export type CreateAssociationSchemaSuccessfulResponse =
  operations['createAssociationSchema']['responses']['201']['content']['application/json'];
export type CreateAssociationSchemaFailureResponse = Exclude<
  CreateAssociationSchemaResponse,
  CreateAssociationSchemaSuccessfulResponse
>;

export type CreateCustomObjectRecordPathParams = paths['/custom_objects/{object_name}/records']['parameters']['path'];
export type CreateCustomObjectRecordQueryParams = never;
export type CreateCustomObjectRecordRequest =
  operations['createCustomObjectRecord']['requestBody']['content']['application/json'];
export type CreateCustomObjectRecordResponse =
  operations['createCustomObjectRecord']['responses'][keyof operations['createCustomObjectRecord']['responses']]['content']['application/json'];
export type CreateCustomObjectRecordSuccessfulResponse =
  operations['createCustomObjectRecord']['responses']['201']['content']['application/json'];
export type CreateCustomObjectRecordFailureResponse = Exclude<
  CreateCustomObjectRecordResponse,
  CreateCustomObjectRecordSuccessfulResponse
>;

export type ListCustomObjectRecordsPathParams = paths['/custom_objects/{object_name}/records']['parameters']['path'];
export type ListCustomObjectRecordsQueryParams = Required<operations['listCustomObjectRecords']>['parameters']['query'];
export type ListCustomObjectRecordsRequest = never;
export type ListCustomObjectRecordsResponse =
  operations['listCustomObjectRecords']['responses'][keyof operations['listCustomObjectRecords']['responses']]['content']['application/json'];
export type ListCustomObjectRecordsSuccessfulResponse =
  operations['listCustomObjectRecords']['responses']['200']['content']['application/json'];
export type ListCustomObjectRecordsFailureResponse = Exclude<
  ListCustomObjectRecordsResponse,
  ListCustomObjectRecordsSuccessfulResponse
>;

export type GetCustomObjectRecordPathParams =
  paths['/custom_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type GetCustomObjectRecordQueryParams = never;
export type GetCustomObjectRecordRequest = never;
export type GetCustomObjectRecordResponse =
  operations['getCustomObjectRecord']['responses'][keyof operations['getCustomObjectRecord']['responses']]['content']['application/json'];
export type GetCustomObjectRecordSuccessfulResponse =
  operations['getCustomObjectRecord']['responses']['200']['content']['application/json'];
export type GetCustomObjectRecordFailureResponse = Exclude<
  GetCustomObjectRecordResponse,
  GetCustomObjectRecordSuccessfulResponse
>;

export type UpdateCustomObjectRecordPathParams =
  paths['/custom_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type UpdateCustomObjectRecordQueryParams = never;
export type UpdateCustomObjectRecordRequest =
  operations['updateCustomObjectRecord']['requestBody']['content']['application/json'];
export type UpdateCustomObjectRecordResponse =
  operations['updateCustomObjectRecord']['responses'][keyof operations['updateCustomObjectRecord']['responses']]['content']['application/json'];
export type UpdateCustomObjectRecordSuccessfulResponse =
  operations['updateCustomObjectRecord']['responses']['200']['content']['application/json'];
export type UpdateCustomObjectRecordFailureResponse = Exclude<
  UpdateCustomObjectRecordResponse,
  UpdateCustomObjectRecordSuccessfulResponse
>;

export type CreateStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records']['parameters']['path'];
export type CreateStandardObjectRecordQueryParams = never;
export type CreateStandardObjectRecordRequest =
  operations['createStandardObjectRecord']['requestBody']['content']['application/json'];
export type CreateStandardObjectRecordResponse =
  operations['createStandardObjectRecord']['responses'][keyof operations['createStandardObjectRecord']['responses']]['content']['application/json'];
export type CreateStandardObjectRecordSuccessfulResponse =
  operations['createStandardObjectRecord']['responses']['201']['content']['application/json'];
export type CreateStandardObjectRecordFailureResponse = Exclude<
  CreateStandardObjectRecordResponse,
  CreateStandardObjectRecordSuccessfulResponse
>;

export type ListStandardObjectRecordsPathParams =
  paths['/standard_objects/{object_name}/records']['parameters']['path'];
export type ListStandardObjectRecordsQueryParams = Required<
  operations['listStandardObjectRecords']
>['parameters']['query'];
export type ListStandardObjectRecordsRequest = never;
export type ListStandardObjectRecordsResponse =
  operations['listStandardObjectRecords']['responses'][keyof operations['listStandardObjectRecords']['responses']]['content']['application/json'];
export type ListStandardObjectRecordsSuccessfulResponse =
  operations['listStandardObjectRecords']['responses']['200']['content']['application/json'];
export type ListStandardObjectRecordsFailureResponse = Exclude<
  ListStandardObjectRecordsResponse,
  ListStandardObjectRecordsSuccessfulResponse
>;

export type GetStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type GetStandardObjectRecordQueryParams = never;
export type GetStandardObjectRecordRequest = never;
export type GetStandardObjectRecordResponse =
  operations['getStandardObjectRecord']['responses'][keyof operations['getStandardObjectRecord']['responses']]['content']['application/json'];
export type GetStandardObjectRecordSuccessfulResponse =
  operations['getStandardObjectRecord']['responses']['200']['content']['application/json'];
export type GetStandardObjectRecordFailureResponse = Exclude<
  GetStandardObjectRecordResponse,
  GetStandardObjectRecordSuccessfulResponse
>;

export type UpdateStandardObjectRecordPathParams =
  paths['/standard_objects/{object_name}/records/{record_id}']['parameters']['path'];
export type UpdateStandardObjectRecordQueryParams = never;
export type UpdateStandardObjectRecordRequest =
  operations['updateStandardObjectRecord']['requestBody']['content']['application/json'];
export type UpdateStandardObjectRecordResponse =
  operations['updateStandardObjectRecord']['responses'][keyof operations['updateStandardObjectRecord']['responses']]['content']['application/json'];
export type UpdateStandardObjectRecordSuccessfulResponse =
  operations['updateStandardObjectRecord']['responses']['201']['content']['application/json'];
export type UpdateStandardObjectRecordFailureResponse = Exclude<
  UpdateStandardObjectRecordResponse,
  UpdateStandardObjectRecordSuccessfulResponse
>;

export type ListAssociationsPathParams = never;
export type ListAssociationsQueryParams = Required<operations['listAssociations']>['parameters']['query'];
export type ListAssociationsRequest = never;
export type ListAssociationsResponse =
  operations['listAssociations']['responses'][keyof operations['listAssociations']['responses']]['content']['application/json'];
export type ListAssociationsSuccessfulResponse =
  operations['listAssociations']['responses']['200']['content']['application/json'];
export type ListAssociationsFailureResponse = Exclude<ListAssociationsResponse, ListAssociationsSuccessfulResponse>;

export type UpsertAssociationPathParams = never;
export type UpsertAssociationQueryParams = never;
export type UpsertAssociationRequest = operations['upsertAssociation']['requestBody']['content']['application/json'];
export type UpsertAssociationResponse =
  operations['upsertAssociation']['responses'][keyof operations['upsertAssociation']['responses']]['content']['application/json'];
export type UpsertAssociationSuccessfulResponse =
  operations['upsertAssociation']['responses']['201']['content']['application/json'];
export type UpsertAssociationFailureResponse = Exclude<UpsertAssociationResponse, UpsertAssociationSuccessfulResponse>;

export type ListPropertiesPathParams = Required<operations['listPropertiesPreview']>['parameters']['path'];
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = never;
export type ListPropertiesResponse =
  operations['listPropertiesPreview']['responses'][keyof operations['listPropertiesPreview']['responses']]['content']['application/json'];
export type ListPropertiesSuccessfulResponse =
  operations['listPropertiesPreview']['responses']['200']['content']['application/json'];
export type ListPropertiesFailureResponse = Exclude<ListPropertiesResponse, ListPropertiesSuccessfulResponse>;

export type GetPropertiesPathParams = Required<operations['getProperty']>['parameters']['path'];
export type GetPropertiesRequest = never;
export type GetPropertiesQueryParams = never;
export type GetPropertiesResponse =
  operations['getProperty']['responses'][keyof operations['getProperty']['responses']]['content']['application/json'];
export type GetPropertiesSuccessfulResponse =
  operations['getProperty']['responses']['200']['content']['application/json'];
export type GetPropertiesFailureResponse = Exclude<GetPropertiesResponse, GetPropertiesSuccessfulResponse>;

export type CreatePropertiesPathParams = Required<operations['createProperty']>['parameters']['path'];
export type CreatePropertiesRequest = Required<
  operations['createProperty']
>['requestBody']['content']['application/json'];
export type CreatePropertiesQueryParams = never;
export type CreatePropertiesResponse =
  operations['createProperty']['responses'][keyof operations['createProperty']['responses']]['content']['application/json'];
export type CreatePropertiesSuccessfulResponse =
  operations['createProperty']['responses']['201']['content']['application/json'];
export type CreatePropertiesFailureResponse = Exclude<CreatePropertiesResponse, CreatePropertiesSuccessfulResponse>;

export type UpdatePropertiesPathParams = Required<operations['updateProperty']>['parameters']['path'];
export type UpdatePropertiesRequest = Required<
  operations['updateProperty']
>['requestBody']['content']['application/json'];
export type UpdatePropertiesQueryParams = never;
export type UpdatePropertiesResponse =
  operations['updateProperty']['responses'][keyof operations['updateProperty']['responses']]['content']['application/json'];
export type UpdatePropertiesSuccessfulResponse =
  operations['updateProperty']['responses']['200']['content']['application/json'];
export type UpdatePropertiesFailureResponse = Exclude<UpdatePropertiesResponse, UpdatePropertiesSuccessfulResponse>;

export type RegisterPropertiesPathParams = Required<operations['registerProperty']>['parameters']['path'];
export type RegisterPropertiesRequest = Required<
  operations['registerProperty']
>['requestBody']['content']['application/json'];
export type RegisterPropertiesQueryParams = never;
export type RegisterPropertiesResponse =
  operations['registerProperty']['responses'][keyof operations['registerProperty']['responses']]['content']['application/json'];
export type RegisterPropertiesSuccessfulResponse =
  operations['registerProperty']['responses']['200']['content']['application/json'];
export type RegisterPropertiesFailureResponse = Exclude<
  RegisterPropertiesResponse,
  RegisterPropertiesSuccessfulResponse
>;

export type ListStandardObjectSchemasPathParams = never;
export type ListStandardObjectSchemasQueryParams = never;
export type ListStandardObjectSchemasRequest = never;
export type ListStandardObjectSchemasResponse =
  operations['listStandardObjectSchemas']['responses'][keyof operations['listStandardObjectSchemas']['responses']]['content']['application/json'];
export type ListStandardObjectSchemasSuccessfulResponse =
  operations['listStandardObjectSchemas']['responses']['200']['content']['application/json'];
export type ListStandardObjectSchemasFailureResponse = Exclude<
  ListStandardObjectSchemasResponse,
  ListStandardObjectSchemasSuccessfulResponse
>;
