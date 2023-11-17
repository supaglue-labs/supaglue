import type { operations, paths, webhooks } from '../gen/v2/mgmt';

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse = operations['getCustomers']['responses'][200]['content']['application/json'];

export type UpsertCustomerPathParams = never;
export type UpsertCustomerRequest = operations['upsertCustomer']['requestBody']['content']['application/json'];
export type UpsertCustomerResponse = operations['upsertCustomer']['responses'][200]['content']['application/json'];

export type GetCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type GetCustomerRequest = never;
export type GetCustomerResponse = operations['getCustomer']['responses'][200]['content']['application/json'];

export type DeleteCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type DeleteCustomerRequest = never;
export type DeleteCustomerResponse = operations['deleteCustomer']['responses'][200]['content']['application/json'];

export type GetDestinationsPathParams = never;
export type GetDestinationsQueryParams = never;
export type GetDestinationsRequest = never;
export type GetDestinationsResponse = operations['getDestinations']['responses'][200]['content']['application/json'];

export type CreateDestinationPathParams = never;
export type CreateDestinationRequest = operations['createDestination']['requestBody']['content']['application/json'];
export type CreateDestinationResponse =
  operations['createDestination']['responses'][201]['content']['application/json'];

export type GetDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type GetDestinationRequest = never;
export type GetDestinationResponse = operations['getDestination']['responses'][200]['content']['application/json'];

export type UpdateDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type UpdateDestinationRequest =
  operations['updateDestination']['requestBody'][keyof operations['updateDestination']['requestBody']]['application/json'];
export type UpdateDestinationResponse =
  operations['updateDestination']['responses'][200]['content']['application/json'];

export type GetSchemasPathParams = never;
export type GetSchemasQueryParams = never;
export type GetSchemasRequest = never;
export type GetSchemasResponse = operations['getSchemas']['responses'][200]['content']['application/json'];

export type CreateSchemaPathParams = never;
export type CreateSchemaRequest = operations['createSchema']['requestBody']['content']['application/json'];
export type CreateSchemaResponse = operations['createSchema']['responses'][201]['content']['application/json'];

export type GetSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type GetSchemaRequest = never;
export type GetSchemaResponse = operations['getSchema']['responses'][200]['content']['application/json'];

export type UpdateSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type UpdateSchemaRequest =
  operations['updateSchema']['requestBody'][keyof operations['updateSchema']['requestBody']]['application/json'];
export type UpdateSchemaResponse = operations['updateSchema']['responses'][200]['content']['application/json'];

export type DeleteSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type DeleteSchemaRequest = never;
export type DeleteSchemaResponse = operations['deleteSchema']['responses'][204]['content']['application/json'];

export type GetProvidersPathParams = never;
export type GetProvidersQueryParams = never;
export type GetProvidersRequest = never;
export type GetProvidersResponse = operations['getProviders']['responses'][200]['content']['application/json'];

export type CreateProviderPathParams = never;
export type CreateProviderRequest = operations['createProvider']['requestBody']['content']['application/json'];
export type CreateProviderResponse = operations['createProvider']['responses'][201]['content']['application/json'];

export type GetProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type GetProviderRequest = never;
export type GetProviderResponse = operations['getProvider']['responses'][200]['content']['application/json'];

export type UpdateProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type UpdateProviderRequest =
  operations['updateProvider']['requestBody'][keyof operations['updateProvider']['requestBody']]['application/json'];
export type UpdateProviderResponse = operations['updateProvider']['responses'][200]['content']['application/json'];

export type DeleteProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type DeleteProviderRequest = never;
export type DeleteProviderResponse = operations['deleteProvider']['responses'][200]['content']['application/json'];

export type GetSyncConfigsPathParams = never;
export type GetSyncConfigsQueryParams = never;
export type GetSyncConfigsRequest = never;
export type GetSyncConfigsResponse = operations['getSyncConfigs']['responses'][200]['content']['application/json'];

export type CreateSyncConfigPathParams = never;
export type CreateSyncConfigRequest = operations['createSyncConfig']['requestBody']['content']['application/json'];
export type CreateSyncConfigResponse = operations['createSyncConfig']['responses'][201]['content']['application/json'];

export type GetSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type GetSyncConfigRequest = never;
export type GetSyncConfigResponse = operations['getSyncConfig']['responses'][200]['content']['application/json'];

export type UpdateSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type UpdateSyncConfigQueryParams = operations['updateSyncConfig']['parameters']['query'];
export type UpdateSyncConfigRequest =
  operations['updateSyncConfig']['requestBody'][keyof operations['updateSyncConfig']['requestBody']]['application/json'];
export type UpdateSyncConfigResponse = operations['updateSyncConfig']['responses'][200]['content']['application/json'];

export type DeleteSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type DeleteSyncConfigQueryParams = operations['deleteSyncConfig']['parameters']['query'];
export type DeleteSyncConfigRequest = never;
export type DeleteSyncConfigResponse = operations['deleteSyncConfig']['responses'][200]['content']['application/json'];

export type GetConnectionsPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type GetConnectionsQueryParams = never;
export type GetConnectionsRequest = never;
export type GetConnectionsResponse = operations['getConnections']['responses'][200]['content']['application/json'];

export type CreateConnectionPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type CreateConnectionQueryParams = never;
export type CreateConnectionRequest = operations['createConnection']['requestBody']['content']['application/json'];
export type CreateConnectionResponse = operations['createConnection']['responses'][200]['content']['application/json'];

export type GetConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse = operations['getConnection']['responses'][200]['content']['application/json'];

export type GetRateLimitInfoPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}/_rate_limit_info`]['parameters']['path'];
export type GetRateLimitInfoRequest = never;
export type GetRateLimitInfoResponse =
  operations['getConnectionRateLimitInfo']['responses'][keyof operations['getConnectionRateLimitInfo']['responses']]['content']['application/json'];

export type GetProviderUserIdPathParams =
  paths[`/customers/{customer_id}/connections/_provider_user_id`]['parameters']['path'];
export type GetProviderUserIdRequest = never;
export type GetProviderUserIdResponse =
  operations['getProviderUserId']['responses'][200]['content']['application/json'];
export type GetProvideruserIdQueryParams = operations['getProviderUserId']['parameters']['query'];

export type DeleteConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse = operations['deleteConnection']['responses'][204]['content']['application/json'];

export type GetMagicLinksPathParams = never;
export type GetMagicLinksQueryParams = never;
export type GetMagicLinksRequest = never;
export type GetMagicLinksResponse = operations['getMagicLinks']['responses'][200]['content']['application/json'];

export type CreateMagicLinkPathParams = never;
export type CreateMagicLinkQueryParams = never;
export type CreateMagicLinkRequest = operations['createMagicLink']['requestBody']['content']['application/json'];
export type CreateMagicLinkResponse = operations['createMagicLink']['responses'][201]['content']['application/json'];

export type DeleteMagicLinkPathParams = paths[`/magic_links/{magic_link_id}`]['parameters']['path'];
export type DeleteMagicLinkRequest = never;
export type DeleteMagicLinkResponse = operations['deleteMagicLink']['responses'][204]['content']['application/json'];

export type ListFieldMappingsPathParams = never;
export type ListFieldMappingsRequest = never;
export type ListFieldMappingsResponse =
  operations['listFieldMappings']['responses'][200]['content']['application/json'];

export type UpdateObjectFieldMappingsPathParams = never;
export type UpdateObjectFieldMappingsRequest =
  operations['updateObjectFieldMappings']['requestBody']['content']['application/json'];
export type UpdateObjectFieldMappingsResponse =
  operations['updateObjectFieldMappings']['responses'][200]['content']['application/json'];

export type GetConnectionSyncConfigPathParams = never;
export type GetConnectionSyncConfigQueryParams = never;
export type GetConnectionSyncConfigRequest = never;
export type GetConnectionSyncConfigResponse =
  operations['getConnectionSyncConfig']['responses'][200]['content']['application/json'];

export type UpsertConnectionSyncConfigPathParams = never;
export type UpsertConnectionSyncConfigQueryParams = never;
export type UpsertConnectionSyncConfigRequest = never;
export type UpsertConnectionSyncConfigResponse =
  operations['upsertConnectionSyncConfig']['responses'][200]['content']['application/json'];

export type DeleteConnectionSyncConfigPathParams = never;
export type DeleteConnectionSyncConfigQueryParams = never;
export type DeleteConnectionSyncConfigRequest = never;
export type DeleteConnectionSyncConfigResponse = never;

export type GetSyncsPathParams = never;
export type GetSyncsQueryParams = Required<operations['getSyncs']>['parameters']['query'];
export type GetSyncsRequest = never;
export type GetSyncsResponse = operations['getSyncs']['responses'][200]['content']['application/json'];

export type PauseSyncPathParams = never;
export type PauseSyncQueryParams = never;
export type PauseSyncRequest = operations['pauseSync']['requestBody']['content']['application/json'];
export type PauseSyncResponse = operations['pauseSync']['responses'][200]['content']['application/json'];

export type ResumeSyncPathParams = never;
export type ResumeSyncQueryParams = never;
export type ResumeSyncRequest = operations['resumeSync']['requestBody']['content']['application/json'];
export type ResumeSyncResponse = operations['resumeSync']['responses'][200]['content']['application/json'];

export type TriggerSyncPathParams = never;
export type TriggerSyncQueryParams = never;
export type TriggerSyncRequest = operations['triggerSync']['requestBody']['content']['application/json'];
export type TriggerSyncResponse = operations['triggerSync']['responses'][200]['content']['application/json'];

export type GetSyncRunsPathParams = never;
export type GetSyncRunsQueryParams = Required<operations['getSyncRuns']>['parameters']['query'];
export type GetSyncRunsRequest = never;
export type GetSyncRunsResponse = operations['getSyncRuns']['responses'][200]['content']['application/json'];

export type GetEntitiesPathParams = never;
export type GetEntitiesQueryParams = never;
export type GetEntitiesRequest = never;
export type GetEntitiesResponse = operations['getEntities']['responses'][200]['content']['application/json'];

export type CreateEntityPathParams = never;
export type CreateEntityRequest = operations['createEntity']['requestBody']['content']['application/json'];
export type CreateEntityResponse = operations['createEntity']['responses'][201]['content']['application/json'];

export type GetEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type GetEntityRequest = never;
export type GetEntityResponse = operations['getEntity']['responses'][200]['content']['application/json'];

export type UpdateEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type UpdateEntityRequest =
  operations['updateEntity']['requestBody'][keyof operations['updateEntity']['requestBody']]['application/json'];
export type UpdateEntityResponse = operations['updateEntity']['responses'][200]['content']['application/json'];

export type DeleteEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type DeleteEntityRequest = never;
export type DeleteEntityResponse = operations['deleteEntity']['responses'][204]['content']['application/json'];

export type ListEntityMappingsPathParams = never;
export type ListEntityMappingsQueryParams = never;
export type ListEntityMappingsRequest = never;
export type ListEntityMappingsResponse =
  operations['listEntityMappings']['responses'][200]['content']['application/json'];

export type UpsertEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type UpsertEntityMappingRequest =
  operations['upsertEntityMapping']['requestBody']['content']['application/json'];
export type UpsertEntityMappingResponse =
  operations['upsertEntityMapping']['responses'][200]['content']['application/json'];

export type DeleteEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type DeleteEntityMappingRequest = never;
export type DeleteEntityMappingResponse = never;

export type WebhookPayloads = {
  [K in keyof webhooks]: Exclude<webhooks[K]['post']['requestBody'], undefined>['content']['application/json'];
};

export type WebhookPayload = Exclude<
  webhooks[keyof webhooks]['post']['requestBody'],
  undefined
>['content']['application/json'];
export type WebhookType = keyof webhooks;
