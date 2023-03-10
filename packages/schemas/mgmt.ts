import type { operations, paths } from './gen/mgmt';

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse =
  operations['getCustomers']['responses'][keyof operations['getCustomers']['responses']]['content']['application/json'];

export type CreateCustomerPathParams = never;
export type CreateCustomerRequest = operations['createCustomer']['requestBody']['content']['application/json'];
export type CreateCustomerResponse =
  operations['createCustomer']['responses'][keyof operations['createCustomer']['responses']]['content']['application/json'];

export type GetCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type GetCustomerRequest = never;
export type GetCustomerResponse =
  operations['getCustomer']['responses'][keyof operations['getCustomer']['responses']]['content']['application/json'];

export type DeleteCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
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

export type GetIntegrationPathParams = paths[`/integrations/{integration_id}`]['parameters']['path'];
export type GetIntegrationRequest = never;
export type GetIntegrationResponse =
  operations['getIntegration']['responses'][keyof operations['getIntegration']['responses']]['content']['application/json'];

export type UpdateIntegrationPathParams = paths[`/integrations/{integration_id}`]['parameters']['path'];
export type UpdateIntegrationRequest = never;
export type UpdateIntegrationResponse =
  operations['updateIntegration']['responses'][keyof operations['updateIntegration']['responses']]['content']['application/json'];

export type DeleteIntegrationPathParams = paths[`/integrations/{integration_id}`]['parameters']['path'];
export type DeleteIntegrationRequest = never;
export type DeleteIntegrationResponse =
  operations['deleteIntegration']['responses'][keyof operations['deleteIntegration']['responses']]['content']['application/json'];

export type GetConnectionsPathParams = never;
export type GetConnectionsQueryParams = never;
export type GetConnectionsRequest = never;
export type GetConnectionsResponse =
  operations['getConnections']['responses'][keyof operations['getConnections']['responses']]['content']['application/json'];

export type GetConnectionPathParams = paths[`/connections/{connection_id}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse =
  operations['getConnection']['responses'][keyof operations['getConnection']['responses']]['content']['application/json'];

export type DeleteConnectionPathParams = paths[`/connections/{connection_id}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse =
  operations['deleteConnection']['responses'][keyof operations['deleteConnection']['responses']]['content']['application/json'];
