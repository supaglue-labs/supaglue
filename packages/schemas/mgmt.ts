import type { operations, paths } from './gen/mgmt';

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse =
  operations['getCustomers']['responses'][keyof operations['getCustomers']['responses']]['content']['application/json'];

export type UpsertCustomerPathParams = never;
export type UpsertCustomerRequest = operations['upsertCustomer']['requestBody']['content']['application/json'];
export type UpsertCustomerResponse =
  operations['upsertCustomer']['responses'][keyof operations['upsertCustomer']['responses']]['content']['application/json'];

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
export type UpdateIntegrationRequest =
  operations['updateIntegration']['requestBody'][keyof operations['updateIntegration']['requestBody']]['application/json'];
export type UpdateIntegrationResponse =
  operations['updateIntegration']['responses'][keyof operations['updateIntegration']['responses']]['content']['application/json'];

export type DeleteIntegrationPathParams = paths[`/integrations/{integration_id}`]['parameters']['path'];
export type DeleteIntegrationRequest = never;
export type DeleteIntegrationResponse =
  operations['deleteIntegration']['responses'][keyof operations['deleteIntegration']['responses']]['content']['application/json'];

export type GetConnectionsPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type GetConnectionsQueryParams = never;
export type GetConnectionsRequest = never;
export type GetConnectionsResponse =
  operations['getConnections']['responses'][keyof operations['getConnections']['responses']]['content']['application/json'];

export type GetConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse =
  operations['getConnection']['responses'][keyof operations['getConnection']['responses']]['content']['application/json'];

export type DeleteConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse =
  operations['deleteConnection']['responses'][keyof operations['deleteConnection']['responses']]['content']['application/json'];

export type CreateWebhookPathParams = never;
export type CreateWebhookRequest = operations['createWebhook']['requestBody']['content']['application/json'];
export type CreateWebhookResponse =
  operations['createWebhook']['responses'][keyof operations['createWebhook']['responses']]['content']['application/json'];

export type GetWebhookPathParams = never;
export type GetWebhookRequest = never;
export type GetWebhookResponse =
  operations['getWebhook']['responses'][keyof operations['getWebhook']['responses']]['content']['application/json'];

export type DeleteWebhookPathParams = never;
export type DeleteWebhookRequest = never;
export type DeleteWebhookResponse = never;

export type GetSyncInfosPathParams = never;
export type GetSyncInfosQueryParams = Required<operations['getSyncInfos']>['parameters']['query'];
export type GetSyncInfosRequest = never;
export type GetSyncInfosResponse =
  operations['getSyncInfos']['responses'][keyof operations['getSyncInfos']['responses']]['content']['application/json'];

export type GetSyncHistoryPathParams = never;
export type GetSyncHistoryQueryParams = Required<operations['getSyncHistory']>['parameters']['query'];
export type GetSyncHistoryRequest = never;
export type GetSyncHistoryResponse =
  operations['getSyncHistory']['responses'][keyof operations['getSyncHistory']['responses']]['content']['application/json'];

export type CreateForceSyncPathParams = never;
export type CreateForceSyncQueryParams = Required<operations['createForceSync']>['parameters']['query'];
export type CreateForceSyncRequest = never;
export type CreateForceSyncResponse =
  operations['createForceSync']['responses'][keyof operations['createForceSync']['responses']]['content']['application/json'];
