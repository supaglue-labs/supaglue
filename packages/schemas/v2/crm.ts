import type { operations, paths } from '../gen/v2/crm';

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

export type GetUserPathParams = paths[`/users/{user_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserQueryParams = any;
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];

export type SendPassthroughRequestPathParams = any;
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type SendPassthroughRequestQueryParams = Required<operations['getUser']>['parameters']['query'];
export type SendPassthroughRequestQueryParams = any;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];

export type CreateCustomObjectPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateCustomObjectQueryParams = Required<operations['createCustomObject']>['parameters']['query'];
export type CreateCustomObjectQueryParams = any;
export type CreateCustomObjectRequest = operations['createCustomObject']['requestBody']['content']['application/json'];
export type CreateCustomObjectResponse =
  operations['createCustomObject']['responses'][keyof operations['createCustomObject']['responses']]['content']['application/json'];

export type GetCustomObjectPathParams = paths[`/custom-objects/{custom_object_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetCustomObjectClassQueryParams = Required<operations['getCustomObjectClass']>['parameters']['query'];
export type GetCustomObjectQueryParams = any;
export type GetCustomObjectRequest = never;
export type GetCustomObjectResponse =
  operations['getCustomObject']['responses'][keyof operations['getCustomObject']['responses']]['content']['application/json'];

export type UpdateCustomObjectPathParams = paths[`/custom-objects/{custom_object_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateCustomObjectQueryParams = Required<operations['updateCustomObject']>['parameters']['query'];
export type UpdateCustomObjectQueryParams = any;
export type UpdateCustomObjectRequest = operations['updateCustomObject']['requestBody']['content']['application/json'];
export type UpdateCustomObjectResponse =
  operations['updateCustomObject']['responses'][keyof operations['updateCustomObject']['responses']]['content']['application/json'];

export type CreateCustomObjectRecordPathParams =
  paths[`/custom-objects/{custom_object_id}/records`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateCustomObjectRecordQueryParams = Required<operations['createCustomObjectRecord']>['parameters']['query'];
export type CreateCustomObjectRecordQueryParams = any;
export type CreateCustomObjectRecordRequest =
  operations['createCustomObjectRecord']['requestBody']['content']['application/json'];
export type CreateCustomObjectRecordResponse =
  operations['createCustomObjectRecord']['responses'][keyof operations['createCustomObjectRecord']['responses']]['content']['application/json'];

export type GetCustomObjectRecordPathParams =
  paths[`/custom-objects/{custom_object_id}/records/{record_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetCustomObjectQueryParams = Required<operations['getCustomObjectRecord']>['parameters']['query'];
export type GetCustomObjectRecordQueryParams = any;
export type GetCustomObjectRecordRequest = never;
export type GetCustomObjectRecordResponse =
  operations['getCustomObjectRecord']['responses'][keyof operations['getCustomObjectRecord']['responses']]['content']['application/json'];

export type UpdateCustomObjectRecordPathParams =
  paths[`/custom-objects/{custom_object_id}/records/{record_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateCustomObjectQueryParams = Required<operations['getCustomObject']>['parameters']['query'];
export type UpdateCustomObjectRecordQueryParams = any;
export type UpdateCustomObjectRecordRequest =
  operations['updateCustomObjectRecord']['requestBody']['content']['application/json'];
export type UpdateCustomObjectRecordResponse =
  operations['updateCustomObjectRecord']['responses'][keyof operations['updateCustomObjectRecord']['responses']]['content']['application/json'];

export type GetAssociationTypesPathParams = never;
export type GetAssociationTypesQueryParams = Required<
  Required<operations['getAssociationTypes']>['parameters']
>['query'];
export type GetAssociationTypesRequest = never;
export type GetAssociationTypesResponse =
  operations['getAssociationTypes']['responses'][keyof operations['getAssociationTypes']['responses']]['content']['application/json'];

export type CreateAssociationTypePathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateAssociationTypeQueryParams = Required<operations['createAssociationType']>['parameters']['query'];
export type CreateAssociationTypeQueryParams = any;
export type CreateAssociationTypeRequest =
  operations['createAssociationType']['requestBody']['content']['application/json'];
export type CreateAssociationTypeResponse =
  operations['createAssociationType']['responses'][keyof operations['createAssociationType']['responses']]['content']['application/json'];

export type CreateAssociationPathParams =
  paths[`/association-types/{association_type_id}/associations`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateAssociationQueryParams = Required<operations['createAssociation']>['parameters']['query'];
export type CreateAssociationQueryParams = any;
export type CreateAssociationRequest = operations['createAssociation']['requestBody']['content']['application/json'];
export type CreateAssociationResponse =
  operations['createAssociation']['responses'][keyof operations['createAssociation']['responses']]['content']['application/json'];
