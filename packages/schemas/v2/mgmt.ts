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

export type GetSchemasPathParams = never;
export type GetSchemasQueryParams = never;
export type GetSchemasRequest = never;
export type GetSchemasResponse =
  operations['getSchemas']['responses'][keyof operations['getSchemas']['responses']]['content']['application/json'];

export type CreateSchemaPathParams = never;
export type CreateSchemaRequest = operations['createSchema']['requestBody']['content']['application/json'];
export type CreateSchemaResponse =
  operations['createSchema']['responses'][keyof operations['createSchema']['responses']]['content']['application/json'];

export type GetSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type GetSchemaRequest = never;
export type GetSchemaResponse =
  operations['getSchema']['responses'][keyof operations['getSchema']['responses']]['content']['application/json'];

export type UpdateSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type UpdateSchemaRequest =
  operations['updateSchema']['requestBody'][keyof operations['updateSchema']['requestBody']]['application/json'];
export type UpdateSchemaResponse =
  operations['updateSchema']['responses'][keyof operations['updateSchema']['responses']]['content']['application/json'];

export type DeleteSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type DeleteSchemaRequest = never;
export type DeleteSchemaResponse =
  operations['deleteSchema']['responses'][keyof operations['deleteSchema']['responses']]['content']['application/json'];

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

export type CreateConnectionPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type CreateConnectionQueryParams = never;
export type CreateConnectionRequest = operations['createConnection']['requestBody']['content']['application/json'];
export type CreateConnectionResponse =
  operations['createConnection']['responses'][keyof operations['createConnection']['responses']]['content']['application/json'];

export type GetConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse =
  operations['getConnection']['responses'][keyof operations['getConnection']['responses']]['content']['application/json'];

export type GetProviderUserIdPathParams =
  paths[`/customers/{customer_id}/connections/_provider_user_id`]['parameters']['path'];
export type GetProviderUserIdRequest = never;
export type GetProviderUserIdResponse =
  operations['getProviderUserId']['responses'][keyof operations['getProviderUserId']['responses']]['content']['application/json'];
export type GetProvideruserIdQueryParams = operations['getProviderUserId']['parameters']['query'];

export type DeleteConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{connection_id}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse =
  operations['deleteConnection']['responses'][keyof operations['deleteConnection']['responses']]['content']['application/json'];

export type ListPropertiesPathParams = never;
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = Required<operations['listProperties']>['parameters']['query'];
export type ListPropertiesResponse =
  operations['listProperties']['responses'][keyof operations['listProperties']['responses']]['content']['application/json'];

export type ListFieldMappingsPathParams = never;
export type ListFieldMappingsRequest = never;
export type ListFieldMappingsResponse =
  operations['listFieldMappings']['responses'][keyof operations['listFieldMappings']['responses']]['content']['application/json'];

export type UpdateObjectFieldMappingsPathParams = never;
export type UpdateObjectFieldMappingsRequest =
  operations['updateObjectFieldMappings']['requestBody']['content']['application/json'];
export type UpdateObjectFieldMappingsResponse =
  operations['updateObjectFieldMappings']['responses'][keyof operations['updateObjectFieldMappings']['responses']]['content']['application/json'];

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

export type GetSyncsPathParams = never;
export type GetSyncsQueryParams = Required<operations['getSyncs']>['parameters']['query'];
export type GetSyncsRequest = never;
export type GetSyncsResponse =
  operations['getSyncs']['responses'][keyof operations['getSyncs']['responses']]['content']['application/json'];

export type PauseSyncPathParams = never;
export type PauseSyncQueryParams = never;
export type PauseSyncRequest = operations['pauseSync']['requestBody']['content']['application/json'];
export type PauseSyncResponse =
  operations['pauseSync']['responses'][keyof operations['pauseSync']['responses']]['content']['application/json'];

export type ResumeSyncPathParams = never;
export type ResumeSyncQueryParams = never;
export type ResumeSyncRequest = operations['resumeSync']['requestBody']['content']['application/json'];
export type ResumeSyncResponse =
  operations['resumeSync']['responses'][keyof operations['resumeSync']['responses']]['content']['application/json'];

export type TriggerSyncPathParams = never;
export type TriggerSyncQueryParams = never;
export type TriggerSyncRequest = operations['triggerSync']['requestBody']['content']['application/json'];
export type TriggerSyncResponse =
  operations['triggerSync']['responses'][keyof operations['triggerSync']['responses']]['content']['application/json'];

export type GetSyncRunsPathParams = never;
export type GetSyncRunsQueryParams = Required<operations['getSyncRuns']>['parameters']['query'];
export type GetSyncRunsRequest = never;
export type GetSyncRunsResponse =
  operations['getSyncRuns']['responses'][keyof operations['getSyncRuns']['responses']]['content']['application/json'];

export type GetEntitiesPathParams = never;
export type GetEntitiesQueryParams = never;
export type GetEntitiesRequest = never;
export type GetEntitiesResponse =
  operations['getEntities']['responses'][keyof operations['getEntities']['responses']]['content']['application/json'];

export type CreateEntityPathParams = never;
export type CreateEntityRequest = operations['createEntity']['requestBody']['content']['application/json'];
export type CreateEntityResponse =
  operations['createEntity']['responses'][keyof operations['createEntity']['responses']]['content']['application/json'];

export type GetEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type GetEntityRequest = never;
export type GetEntityResponse =
  operations['getEntity']['responses'][keyof operations['getEntity']['responses']]['content']['application/json'];

export type UpdateEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type UpdateEntityRequest =
  operations['updateEntity']['requestBody'][keyof operations['updateEntity']['requestBody']]['application/json'];
export type UpdateEntityResponse =
  operations['updateEntity']['responses'][keyof operations['updateEntity']['responses']]['content']['application/json'];

export type DeleteEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type DeleteEntityRequest = never;
export type DeleteEntityResponse =
  operations['deleteEntity']['responses'][keyof operations['deleteEntity']['responses']]['content']['application/json'];

export type ListEntityMappingsPathParams = never;
export type ListEntityMappingsQueryParams = never;
export type ListEntityMappingsRequest = never;
export type ListEntityMappingsResponse =
  operations['listEntityMappings']['responses'][keyof operations['listEntityMappings']['responses']]['content']['application/json'];

export type UpsertEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type UpsertEntityMappingRequest =
  operations['upsertEntityMapping']['requestBody']['content']['application/json'];
export type UpsertEntityMappingResponse =
  operations['upsertEntityMapping']['responses'][keyof operations['upsertEntityMapping']['responses']]['content']['application/json'];

export type DeleteEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type DeleteEntityMappingRequest = never;
export type DeleteEntityMappingResponse = never;
