import type { operations, paths } from '../gen/v2/mgmt';

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

export type GetDestinationsPathParams = never;
export type GetDestinationsQueryParams = never;
export type GetDestinationsRequest = never;
export type GetDestinationsResponse =
  operations['getDestinations']['responses'][keyof operations['getDestinations']['responses']]['content']['application/json'];

export type CreateDestinationPathParams = never;
export type CreateDestinationRequest = operations['createDestination']['requestBody']['content']['application/json'];
export type CreateDestinationResponse =
  operations['createDestination']['responses'][keyof operations['createDestination']['responses']]['content']['application/json'];

export type GetDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type GetDestinationRequest = never;
export type GetDestinationResponse =
  operations['getDestination']['responses'][keyof operations['getDestination']['responses']]['content']['application/json'];

export type UpdateDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type UpdateDestinationRequest =
  operations['updateDestination']['requestBody'][keyof operations['updateDestination']['requestBody']]['application/json'];
export type UpdateDestinationResponse =
  operations['updateDestination']['responses'][keyof operations['updateDestination']['responses']]['content']['application/json'];

export type GetProvidersPathParams = never;
export type GetProvidersQueryParams = never;
export type GetProvidersRequest = never;
export type GetProvidersResponse =
  operations['getProviders']['responses'][keyof operations['getProviders']['responses']]['content']['application/json'];

export type CreateProviderPathParams = never;
export type CreateProviderRequest = operations['createProvider']['requestBody']['content']['application/json'];
export type CreateProviderResponse =
  operations['createProvider']['responses'][keyof operations['createProvider']['responses']]['content']['application/json'];

export type GetProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type GetProviderRequest = never;
export type GetProviderResponse =
  operations['getProvider']['responses'][keyof operations['getProvider']['responses']]['content']['application/json'];

export type UpdateProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type UpdateProviderRequest =
  operations['updateProvider']['requestBody'][keyof operations['updateProvider']['requestBody']]['application/json'];
export type UpdateProviderResponse =
  operations['updateProvider']['responses'][keyof operations['updateProvider']['responses']]['content']['application/json'];

export type DeleteProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type DeleteProviderRequest = never;
export type DeleteProviderResponse =
  operations['deleteProvider']['responses'][keyof operations['deleteProvider']['responses']]['content']['application/json'];

export type GetSyncConfigsPathParams = never;
export type GetSyncConfigsQueryParams = never;
export type GetSyncConfigsRequest = never;
export type GetSyncConfigsResponse =
  operations['getSyncConfigs']['responses'][keyof operations['getSyncConfigs']['responses']]['content']['application/json'];

export type CreateSyncConfigPathParams = never;
export type CreateSyncConfigRequest = operations['createSyncConfig']['requestBody']['content']['application/json'];
export type CreateSyncConfigResponse =
  operations['createSyncConfig']['responses'][keyof operations['createSyncConfig']['responses']]['content']['application/json'];

export type GetSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type GetSyncConfigRequest = never;
export type GetSyncConfigResponse =
  operations['getSyncConfig']['responses'][keyof operations['getSyncConfig']['responses']]['content']['application/json'];

export type UpdateSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type UpdateSyncConfigRequest =
  operations['updateSyncConfig']['requestBody'][keyof operations['updateSyncConfig']['requestBody']]['application/json'];
export type UpdateSyncConfigResponse =
  operations['updateSyncConfig']['responses'][keyof operations['updateSyncConfig']['responses']]['content']['application/json'];

export type DeleteSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type DeleteSyncConfigRequest = never;
export type DeleteSyncConfigResponse =
  operations['deleteSyncConfig']['responses'][keyof operations['deleteSyncConfig']['responses']]['content']['application/json'];

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
