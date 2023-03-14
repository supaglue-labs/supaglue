import type { operations, paths } from './gen/mgmt';

export type GetApplicationsPathParams = never;
export type GetApplicationsQueryParams = never;
export type GetApplicationsRequest = never;
export type GetApplicationsResponse =
  operations['getApplications']['responses'][keyof operations['getApplications']['responses']]['content']['application/json'];

export type CreateApplicationPathParams = never;
export type CreateApplicationRequest = operations['createApplication']['requestBody']['content']['application/json'];
export type CreateApplicationResponse =
  operations['createApplication']['responses'][keyof operations['createApplication']['responses']]['content']['application/json'];

export type GetApplicationPathParams = paths[`/applications/{application_id}`]['parameters']['path'];
export type GetApplicationRequest = never;
export type GetApplicationResponse =
  operations['getApplication']['responses'][keyof operations['getApplication']['responses']]['content']['application/json'];

export type UpdateApplicationPathParams = paths[`/applications/{application_id}`]['parameters']['path'];
export type UpdateApplicationRequest = never;
export type UpdateApplicationResponse =
  operations['updateApplication']['responses'][keyof operations['updateApplication']['responses']]['content']['application/json'];

export type DeleteApplicationPathParams = paths[`/applications/{application_id}`]['parameters']['path'];
export type DeleteApplicationRequest = never;
export type DeleteApplicationResponse =
  operations['deleteApplication']['responses'][keyof operations['deleteApplication']['responses']]['content']['application/json'];

export type CreateApplicationApiKeyPathParams =
  paths[`/applications/{application_id}/_generate_api_key`]['parameters']['path'];
export type CreateApplicationApiKeyRequest = never;
export type CreateApplicationApiKeyResponse =
  operations['createApplicationApiKey']['responses'][keyof operations['createApplicationApiKey']['responses']]['content']['application/json'];

export type RevokeApplicationApiKeyPathParams =
  paths[`/applications/{application_id}/_revoke_api_key`]['parameters']['path'];
export type RevokeApplicationApiKeyRequest = never;
export type RevokeApplicationApiKeyResponse =
  operations['deleteApplicationApiKey']['responses'][keyof operations['deleteApplicationApiKey']['responses']]['content']['application/json'];

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse =
  operations['getCustomers']['responses'][keyof operations['getCustomers']['responses']]['content']['application/json'];

export type UpsertCustomerPathParams = never;
export type UpsertCustomerRequest = operations['upsertCustomer']['requestBody']['content']['application/json'];
export type UpsertCustomerResponse =
  operations['upsertCustomer']['responses'][keyof operations['upsertCustomer']['responses']]['content']['application/json'];

export type GetCustomerPathParams =
  paths[`/applications/{application_id}/customers/{customer_id}`]['parameters']['path'];
export type GetCustomerRequest = never;
export type GetCustomerResponse =
  operations['getCustomer']['responses'][keyof operations['getCustomer']['responses']]['content']['application/json'];

export type DeleteCustomerPathParams =
  paths[`/applications/{application_id}/customers/{customer_id}`]['parameters']['path'];
export type DeleteCustomerRequest = never;
export type DeleteCustomerResponse =
  operations['deleteCustomer']['responses'][keyof operations['deleteCustomer']['responses']]['content']['application/json'];

export type GetIntegrationsPathParams = never;
export type GetIntegrationsQueryParams = never;
export type GetIntegrationsRequest = never;
export type GetIntegrationsResponse =
  operations['getIntegrations']['responses'][keyof operations['getIntegrations']['responses']]['content']['application/json'];

export type CreateIntegrationPathParams = never;
export type CreateIntegrationRequest = operations['createIntegration']['requestBody']['content']['application/json'];
export type CreateIntegrationResponse =
  operations['createIntegration']['responses'][keyof operations['createIntegration']['responses']]['content']['application/json'];

export type GetIntegrationPathParams =
  paths[`/applications/{application_id}/integrations/{integration_id}`]['parameters']['path'];
export type GetIntegrationRequest = never;
export type GetIntegrationResponse =
  operations['getIntegration']['responses'][keyof operations['getIntegration']['responses']]['content']['application/json'];

export type UpdateIntegrationPathParams =
  paths[`/applications/{application_id}/integrations/{integration_id}`]['parameters']['path'];
export type UpdateIntegrationRequest = never;
export type UpdateIntegrationResponse =
  operations['updateIntegration']['responses'][keyof operations['updateIntegration']['responses']]['content']['application/json'];

export type DeleteIntegrationPathParams =
  paths[`/applications/{application_id}/integrations/{integration_id}`]['parameters']['path'];
export type DeleteIntegrationRequest = never;
export type DeleteIntegrationResponse =
  operations['deleteIntegration']['responses'][keyof operations['deleteIntegration']['responses']]['content']['application/json'];

export type GetConnectionsPathParams = never;
export type GetConnectionsQueryParams = never;
export type GetConnectionsRequest = never;
export type GetConnectionsResponse =
  operations['getConnections']['responses'][keyof operations['getConnections']['responses']]['content']['application/json'];

export type GetConnectionPathParams =
  paths[`/applications/{application_id}/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse =
  operations['getConnection']['responses'][keyof operations['getConnection']['responses']]['content']['application/json'];

export type DeleteConnectionPathParams =
  paths[`/applications/{application_id}/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse =
  operations['deleteConnection']['responses'][keyof operations['deleteConnection']['responses']]['content']['application/json'];
