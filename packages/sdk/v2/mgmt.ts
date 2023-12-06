import type { operations, paths, webhooks } from '../gen/v2/mgmt';

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse =
  operations['getCustomers']['responses'][keyof operations['getCustomers']['responses']]['content']['application/json'];
export type GetCustomersSuccessfulResponse =
  operations['getCustomers']['responses']['200']['content']['application/json'];
export type GetCustomersFailureResponse = Exclude<GetCustomersResponse, GetCustomersSuccessfulResponse>;

export type UpsertCustomerPathParams = never;
export type UpsertCustomerRequest = operations['upsertCustomer']['requestBody']['content']['application/json'];
export type UpsertCustomerResponse =
  operations['upsertCustomer']['responses'][keyof operations['upsertCustomer']['responses']]['content']['application/json'];
export type UpsertCustomerSuccessfulResponse =
  operations['upsertCustomer']['responses']['200']['content']['application/json'];
export type UpsertCustomerFailureResponse = Exclude<UpsertCustomerResponse, UpsertCustomerSuccessfulResponse>;

export type GetCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type GetCustomerRequest = never;
export type GetCustomerResponse =
  operations['getCustomer']['responses'][keyof operations['getCustomer']['responses']]['content']['application/json'];
export type GetCustomerSuccessfulResponse =
  operations['getCustomer']['responses']['200']['content']['application/json'];
export type GetCustomerFailureResponse = Exclude<GetCustomerResponse, GetCustomerSuccessfulResponse>;

export type DeleteCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type DeleteCustomerRequest = never;
export type DeleteCustomerResponse =
  operations['deleteCustomer']['responses'][keyof operations['deleteCustomer']['responses']]['content']['application/json'];
export type DeleteCustomerSuccessfulResponse =
  operations['deleteCustomer']['responses']['204']['content']['application/json'];
export type DeleteCustomerFailureResponse = Exclude<DeleteCustomerResponse, DeleteCustomerSuccessfulResponse>;

export type GetDestinationsPathParams = never;
export type GetDestinationsQueryParams = never;
export type GetDestinationsRequest = never;
export type GetDestinationsResponse =
  operations['getDestinations']['responses'][keyof operations['getDestinations']['responses']]['content']['application/json'];
export type GetDestinationsSuccessfulResponse =
  operations['getDestinations']['responses']['200']['content']['application/json'];
export type GetDestinationsFailureResponse = Exclude<GetDestinationsResponse, GetDestinationsSuccessfulResponse>;

export type CreateDestinationPathParams = never;
export type CreateDestinationRequest = operations['createDestination']['requestBody']['content']['application/json'];
export type CreateDestinationResponse =
  operations['createDestination']['responses'][keyof operations['createDestination']['responses']]['content']['application/json'];
export type CreateDestinationSuccessfulResponse =
  operations['createDestination']['responses']['201']['content']['application/json'];
export type CreateDestinationFailureResponse = Exclude<CreateDestinationResponse, CreateDestinationSuccessfulResponse>;

export type GetDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type GetDestinationRequest = never;
export type GetDestinationResponse =
  operations['getDestination']['responses'][keyof operations['getDestination']['responses']]['content']['application/json'];
export type GetDestinationSuccessfulResponse =
  operations['getDestination']['responses']['200']['content']['application/json'];
export type GetDestinationFailureResponse = Exclude<GetDestinationResponse, GetDestinationSuccessfulResponse>;

export type UpdateDestinationPathParams = paths[`/destinations/{destination_id}`]['parameters']['path'];
export type UpdateDestinationRequest =
  operations['updateDestination']['requestBody'][keyof operations['updateDestination']['requestBody']]['application/json'];
export type UpdateDestinationResponse =
  operations['updateDestination']['responses'][keyof operations['updateDestination']['responses']]['content']['application/json'];
export type UpdateDestinationSuccessfulResponse =
  operations['updateDestination']['responses']['200']['content']['application/json'];
export type UpdateDestinationFailureResponse = Exclude<UpdateDestinationResponse, UpdateDestinationSuccessfulResponse>;

export type GetSchemasPathParams = never;
export type GetSchemasQueryParams = never;
export type GetSchemasRequest = never;
export type GetSchemasResponse =
  operations['getSchemas']['responses'][keyof operations['getSchemas']['responses']]['content']['application/json'];
export type GetSchemasSuccessfulResponse = operations['getSchemas']['responses']['200']['content']['application/json'];
export type GetSchemasFailureResponse = Exclude<GetSchemasResponse, GetSchemasSuccessfulResponse>;

export type CreateSchemaPathParams = never;
export type CreateSchemaRequest = operations['createSchema']['requestBody']['content']['application/json'];
export type CreateSchemaResponse =
  operations['createSchema']['responses'][keyof operations['createSchema']['responses']]['content']['application/json'];
export type CreateSchemaSuccessfulResponse =
  operations['createSchema']['responses']['201']['content']['application/json'];
export type CreateSchemaFailureResponse = Exclude<CreateSchemaResponse, CreateSchemaSuccessfulResponse>;

export type GetSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type GetSchemaRequest = never;
export type GetSchemaResponse =
  operations['getSchema']['responses'][keyof operations['getSchema']['responses']]['content']['application/json'];
export type GetSchemaSuccessfulResponse = operations['getSchema']['responses']['200']['content']['application/json'];
export type GetSchemaFailureResponse = Exclude<GetSchemaResponse, GetSchemaSuccessfulResponse>;

export type UpdateSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type UpdateSchemaRequest =
  operations['updateSchema']['requestBody'][keyof operations['updateSchema']['requestBody']]['application/json'];
export type UpdateSchemaResponse =
  operations['updateSchema']['responses'][keyof operations['updateSchema']['responses']]['content']['application/json'];
export type UpdateSchemaSuccessfulResponse =
  operations['updateSchema']['responses']['200']['content']['application/json'];
export type UpdateSchemaFailureResponse = Exclude<UpdateSchemaResponse, UpdateSchemaSuccessfulResponse>;

export type DeleteSchemaPathParams = paths[`/schemas/{schema_id}`]['parameters']['path'];
export type DeleteSchemaRequest = never;
export type DeleteSchemaResponse =
  operations['deleteSchema']['responses'][keyof operations['deleteSchema']['responses']]['content']['application/json'];
export type DeleteSchemaSuccessfulResponse =
  operations['deleteSchema']['responses']['204']['content']['application/json'];
export type DeleteSchemaFailureResponse = Exclude<DeleteSchemaResponse, DeleteSchemaSuccessfulResponse>;

export type GetProvidersPathParams = never;
export type GetProvidersQueryParams = never;
export type GetProvidersRequest = never;
export type GetProvidersResponse =
  operations['getProviders']['responses'][keyof operations['getProviders']['responses']]['content']['application/json'];
export type GetProvidersSuccessfulResponse =
  operations['getProviders']['responses']['200']['content']['application/json'];
export type GetProvidersFailureResponse = Exclude<GetProvidersResponse, GetProvidersSuccessfulResponse>;

export type CreateProviderPathParams = never;
export type CreateProviderRequest = operations['createProvider']['requestBody']['content']['application/json'];
export type CreateProviderResponse =
  operations['createProvider']['responses'][keyof operations['createProvider']['responses']]['content']['application/json'];
export type CreateProviderSuccessfulResponse =
  operations['createProvider']['responses']['201']['content']['application/json'];
export type CreateProviderFailureResponse = Exclude<CreateProviderResponse, CreateProviderSuccessfulResponse>;

export type GetProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type GetProviderRequest = never;
export type GetProviderResponse =
  operations['getProvider']['responses'][keyof operations['getProvider']['responses']]['content']['application/json'];
export type GetProviderSuccessfulResponse =
  operations['getProvider']['responses']['200']['content']['application/json'];
export type GetProviderFailureResponse = Exclude<GetProviderResponse, GetProviderSuccessfulResponse>;

export type UpdateProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type UpdateProviderRequest =
  operations['updateProvider']['requestBody'][keyof operations['updateProvider']['requestBody']]['application/json'];
export type UpdateProviderResponse =
  operations['updateProvider']['responses'][keyof operations['updateProvider']['responses']]['content']['application/json'];
export type UpdateProviderSuccessfulResponse =
  operations['updateProvider']['responses']['200']['content']['application/json'];
export type UpdateProviderFailureResponse = Exclude<UpdateProviderResponse, UpdateProviderSuccessfulResponse>;

export type DeleteProviderPathParams = paths[`/providers/{provider_id}`]['parameters']['path'];
export type DeleteProviderRequest = never;
export type DeleteProviderResponse =
  operations['deleteProvider']['responses'][keyof operations['deleteProvider']['responses']]['content']['application/json'];
export type DeleteProviderSuccessfulResponse =
  operations['deleteProvider']['responses']['200']['content']['application/json'];
export type DeleteProviderFailureResponse = Exclude<DeleteProviderResponse, DeleteProviderSuccessfulResponse>;

export type GetSyncConfigsPathParams = never;
export type GetSyncConfigsQueryParams = never;
export type GetSyncConfigsRequest = never;
export type GetSyncConfigsResponse =
  operations['getSyncConfigs']['responses'][keyof operations['getSyncConfigs']['responses']]['content']['application/json'];
export type GetSyncConfigsSuccessfulResponse =
  operations['getSyncConfigs']['responses']['200']['content']['application/json'];
export type GetSyncConfigsFailureResponse = Exclude<GetSyncConfigsResponse, GetSyncConfigsSuccessfulResponse>;

export type CreateSyncConfigPathParams = never;
export type CreateSyncConfigRequest = operations['createSyncConfig']['requestBody']['content']['application/json'];
export type CreateSyncConfigResponse =
  operations['createSyncConfig']['responses'][keyof operations['createSyncConfig']['responses']]['content']['application/json'];
export type CreateSyncConfigSuccessfulResponse =
  operations['createSyncConfig']['responses']['201']['content']['application/json'];
export type CreateSyncConfigFailureResponse = Exclude<CreateSyncConfigResponse, CreateSyncConfigSuccessfulResponse>;

export type GetSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type GetSyncConfigRequest = never;
export type GetSyncConfigResponse =
  operations['getSyncConfig']['responses'][keyof operations['getSyncConfig']['responses']]['content']['application/json'];
export type GetSyncConfigSuccessfulResponse =
  operations['getSyncConfig']['responses']['200']['content']['application/json'];
export type GetSyncConfigFailureResponse = Exclude<GetSyncConfigResponse, GetSyncConfigSuccessfulResponse>;

export type UpdateSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type UpdateSyncConfigQueryParams = operations['updateSyncConfig']['parameters']['query'];
export type UpdateSyncConfigRequest =
  operations['updateSyncConfig']['requestBody'][keyof operations['updateSyncConfig']['requestBody']]['application/json'];
export type UpdateSyncConfigResponse =
  operations['updateSyncConfig']['responses'][keyof operations['updateSyncConfig']['responses']]['content']['application/json'];
export type UpdateSyncConfigSuccessfulResponse =
  operations['updateSyncConfig']['responses']['200']['content']['application/json'];
export type UpdateSyncConfigFailureResponse = Exclude<UpdateSyncConfigResponse, UpdateSyncConfigSuccessfulResponse>;

export type DeleteSyncConfigPathParams = paths[`/sync_configs/{sync_config_id}`]['parameters']['path'];
export type DeleteSyncConfigQueryParams = operations['deleteSyncConfig']['parameters']['query'];
export type DeleteSyncConfigRequest = never;
export type DeleteSyncConfigResponse =
  operations['deleteSyncConfig']['responses'][keyof operations['deleteSyncConfig']['responses']]['content']['application/json'];
export type DeleteSyncConfigSuccessfulResponse =
  operations['deleteSyncConfig']['responses']['200']['content']['application/json'];
export type DeleteSyncConfigFailureResponse = Exclude<DeleteSyncConfigResponse, DeleteSyncConfigSuccessfulResponse>;

export type GetConnectionsPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type GetConnectionsQueryParams = never;
export type GetConnectionsRequest = never;
export type GetConnectionsResponse =
  operations['getConnections']['responses'][keyof operations['getConnections']['responses']]['content']['application/json'];
export type GetConnectionsSuccessfulResponse =
  operations['getConnections']['responses']['200']['content']['application/json'];
export type GetConnectionsFailureResponse = Exclude<GetConnectionsResponse, GetConnectionsSuccessfulResponse>;

export type CreateConnectionPathParams = paths['/customers/{customer_id}/connections']['parameters']['path'];
export type CreateConnectionQueryParams = never;
export type CreateConnectionRequest = operations['createConnection']['requestBody']['content']['application/json'];
export type CreateConnectionResponse =
  operations['createConnection']['responses'][keyof operations['createConnection']['responses']]['content']['application/json'];
export type CreateConnectionSuccessfulResponse =
  operations['createConnection']['responses']['200']['content']['application/json'];
export type CreateConnectionFailureResponse = Exclude<CreateConnectionResponse, CreateConnectionSuccessfulResponse>;

export type GetConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}`]['parameters']['path'];
export type GetConnectionRequest = never;
export type GetConnectionResponse =
  operations['getConnection']['responses'][keyof operations['getConnection']['responses']]['content']['application/json'];
export type GetConnectionSuccessfulResponse =
  operations['getConnection']['responses']['200']['content']['application/json'];
export type GetConnectionFailureResponse = Exclude<GetConnectionResponse, GetConnectionSuccessfulResponse>;

export type GetRateLimitInfoPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}/_rate_limit_info`]['parameters']['path'];
export type GetRateLimitInfoRequest = never;
export type GetRateLimitInfoResponse =
  operations['getConnectionRateLimitInfo']['responses'][keyof operations['getConnectionRateLimitInfo']['responses']]['content']['application/json'];

export type GetProviderUserIdPathParams =
  paths[`/customers/{customer_id}/connections/_provider_user_id`]['parameters']['path'];
export type GetProviderUserIdRequest = never;
export type GetProviderUserIdResponse =
  operations['getProviderUserId']['responses'][keyof operations['getProviderUserId']['responses']]['content']['application/json'];
export type GetProvideruserIdQueryParams = operations['getProviderUserId']['parameters']['query'];
export type GetProviderUserIdSuccessfulResponse =
  operations['getProviderUserId']['responses']['200']['content']['application/json'];
export type GetProviderUserIdFailureResponse = Exclude<GetProviderUserIdResponse, GetProviderUserIdSuccessfulResponse>;

export type DeleteConnectionPathParams =
  paths[`/customers/{customer_id}/connections/{provider_name}`]['parameters']['path'];
export type DeleteConnectionRequest = never;
export type DeleteConnectionResponse =
  operations['deleteConnection']['responses'][keyof operations['deleteConnection']['responses']]['content']['application/json'];
export type DeleteConnectionSuccessfulResponse =
  operations['deleteConnection']['responses']['204']['content']['application/json'];
export type DeleteConnectionFailureResponse = Exclude<DeleteConnectionResponse, DeleteConnectionSuccessfulResponse>;

export type GetMagicLinksPathParams = never;
export type GetMagicLinksQueryParams = never;
export type GetMagicLinksRequest = never;
export type GetMagicLinksResponse =
  operations['getMagicLinks']['responses'][keyof operations['getMagicLinks']['responses']]['content']['application/json'];
export type GetMagicLinksSuccessfulResponse =
  operations['getMagicLinks']['responses']['200']['content']['application/json'];
export type GetMagicLinksFailureResponse = Exclude<GetMagicLinksResponse, GetMagicLinksSuccessfulResponse>;

export type CreateMagicLinkPathParams = never;
export type CreateMagicLinkQueryParams = never;
export type CreateMagicLinkRequest = operations['createMagicLink']['requestBody']['content']['application/json'];
export type CreateMagicLinkResponse =
  operations['createMagicLink']['responses'][keyof operations['createMagicLink']['responses']]['content']['application/json'];
export type CreateMagicLinkSuccessfulResponse =
  operations['createMagicLink']['responses']['201']['content']['application/json'];
export type CreateMagicLinkFailureResponse = Exclude<CreateMagicLinkResponse, CreateMagicLinkSuccessfulResponse>;

export type DeleteMagicLinkPathParams = paths[`/magic_links/{magic_link_id}`]['parameters']['path'];
export type DeleteMagicLinkRequest = never;
export type DeleteMagicLinkResponse =
  operations['deleteMagicLink']['responses'][keyof operations['deleteMagicLink']['responses']]['content']['application/json'];
export type DeleteMagicLinkSuccessfulResponse =
  operations['deleteMagicLink']['responses']['204']['content']['application/json'];
export type DeleteMagicLinkFailureResponse = Exclude<DeleteMagicLinkResponse, DeleteMagicLinkSuccessfulResponse>;

export type ListFieldMappingsPathParams = never;
export type ListFieldMappingsRequest = never;
export type ListFieldMappingsResponse =
  operations['listFieldMappings']['responses'][keyof operations['listFieldMappings']['responses']]['content']['application/json'];
export type ListFieldMappingsSuccessfulResponse =
  operations['listFieldMappings']['responses']['200']['content']['application/json'];
export type ListFieldMappingsFailureResponse = Exclude<ListFieldMappingsResponse, ListFieldMappingsSuccessfulResponse>;

export type UpdateObjectFieldMappingsPathParams = never;
export type UpdateObjectFieldMappingsRequest =
  operations['updateObjectFieldMappings']['requestBody']['content']['application/json'];
export type UpdateObjectFieldMappingsResponse =
  operations['updateObjectFieldMappings']['responses'][keyof operations['updateObjectFieldMappings']['responses']]['content']['application/json'];
export type UpdateObjectFieldMappingsSuccessfulResponse =
  operations['updateObjectFieldMappings']['responses']['200']['content']['application/json'];
export type UpdateObjectFieldMappingsFailureResponse = Exclude<
  UpdateObjectFieldMappingsResponse,
  UpdateObjectFieldMappingsSuccessfulResponse
>;

export type GetConnectionSyncConfigPathParams = never;
export type GetConnectionSyncConfigQueryParams = never;
export type GetConnectionSyncConfigRequest = never;
export type GetConnectionSyncConfigResponse =
  operations['getConnectionSyncConfig']['responses'][keyof operations['getConnectionSyncConfig']['responses']]['content']['application/json'];
export type GetConnectionSyncConfigSuccessfulResponse =
  operations['getConnectionSyncConfig']['responses']['200']['content']['application/json'];
export type GetConnectionSyncConfigFailureResponse = Exclude<
  GetConnectionSyncConfigResponse,
  GetConnectionSyncConfigSuccessfulResponse
>;

export type UpsertConnectionSyncConfigPathParams = never;
export type UpsertConnectionSyncConfigQueryParams = never;
export type UpsertConnectionSyncConfigRequest = never;
export type UpsertConnectionSyncConfigResponse =
  operations['upsertConnectionSyncConfig']['responses'][keyof operations['upsertConnectionSyncConfig']['responses']]['content']['application/json'];
export type UpsertConnectionSyncConfigSuccessfulResponse =
  operations['upsertConnectionSyncConfig']['responses']['200']['content']['application/json'];
export type UpsertConnectionSyncConfigFailureResponse = Exclude<
  UpsertConnectionSyncConfigResponse,
  UpsertConnectionSyncConfigSuccessfulResponse
>;

export type DeleteConnectionSyncConfigPathParams = never;
export type DeleteConnectionSyncConfigQueryParams = never;
export type DeleteConnectionSyncConfigRequest = never;
export type DeleteConnectionSyncConfigResponse = never;
export type DeleteConnectionSyncConfigSuccessfulResponse =
  operations['deleteConnectionSyncConfig']['responses']['204']['content']['application/json'];
export type DeleteConnectionSyncConfigFailureResponse = Exclude<
  DeleteConnectionSyncConfigResponse,
  DeleteConnectionSyncConfigSuccessfulResponse
>;

export type GetSyncsPathParams = never;
export type GetSyncsQueryParams = Required<operations['listSyncs']>['parameters']['query'];
export type GetSyncsRequest = never;
export type GetSyncsResponse =
  operations['listSyncs']['responses'][keyof operations['listSyncs']['responses']]['content']['application/json'];
export type GetSyncsSuccessfulResponse = operations['listSyncs']['responses']['200']['content']['application/json'];
export type GetSyncsFailureResponse = Exclude<GetSyncsResponse, GetSyncsSuccessfulResponse>;

export type PauseSyncPathParams = never;
export type PauseSyncQueryParams = never;
export type PauseSyncRequest = operations['pauseSync']['requestBody']['content']['application/json'];
export type PauseSyncResponse =
  operations['pauseSync']['responses'][keyof operations['pauseSync']['responses']]['content']['application/json'];
export type PauseSyncSuccessfulResponse = operations['pauseSync']['responses']['200']['content']['application/json'];
export type PauseSyncFailureResponse = Exclude<PauseSyncResponse, PauseSyncSuccessfulResponse>;

export type ResumeSyncPathParams = never;
export type ResumeSyncQueryParams = never;
export type ResumeSyncRequest = operations['resumeSync']['requestBody']['content']['application/json'];
export type ResumeSyncResponse =
  operations['resumeSync']['responses'][keyof operations['resumeSync']['responses']]['content']['application/json'];
export type ResumeSyncSuccessfulResponse = operations['resumeSync']['responses']['200']['content']['application/json'];
export type ResumeSyncFailureResponse = Exclude<ResumeSyncResponse, ResumeSyncSuccessfulResponse>;

export type TriggerSyncPathParams = never;
export type TriggerSyncQueryParams = never;
export type TriggerSyncRequest = operations['triggerSync']['requestBody']['content']['application/json'];
export type TriggerSyncResponse =
  operations['triggerSync']['responses'][keyof operations['triggerSync']['responses']]['content']['application/json'];
export type TriggerSyncSuccessfulResponse =
  operations['triggerSync']['responses']['200']['content']['application/json'];
export type TriggerSyncFailureResponse = Exclude<TriggerSyncResponse, TriggerSyncSuccessfulResponse>;

export type GetSyncRunsPathParams = never;
export type GetSyncRunsQueryParams = Required<operations['listSyncRuns']>['parameters']['query'];
export type GetSyncRunsRequest = never;
export type GetSyncRunsResponse =
  operations['listSyncRuns']['responses'][keyof operations['listSyncRuns']['responses']]['content']['application/json'];
export type GetSyncRunsSuccessfulResponse =
  operations['listSyncRuns']['responses']['200']['content']['application/json'];
export type GetSyncRunsFailureResponse = Exclude<GetSyncRunsResponse, GetSyncRunsSuccessfulResponse>;

export type GetEntitiesPathParams = never;
export type GetEntitiesQueryParams = never;
export type GetEntitiesRequest = never;
export type GetEntitiesResponse =
  operations['getEntities']['responses'][keyof operations['getEntities']['responses']]['content']['application/json'];
export type GetEntitiesSuccessfulResponse =
  operations['getEntities']['responses']['200']['content']['application/json'];
export type GetEntitiesFailureResponse = Exclude<GetEntitiesResponse, GetEntitiesSuccessfulResponse>;

export type CreateEntityPathParams = never;
export type CreateEntityRequest = operations['createEntity']['requestBody']['content']['application/json'];
export type CreateEntityResponse =
  operations['createEntity']['responses'][keyof operations['createEntity']['responses']]['content']['application/json'];
export type CreateEntitySuccessfulResponse =
  operations['createEntity']['responses']['201']['content']['application/json'];
export type CreateEntityFailureResponse = Exclude<CreateEntityResponse, CreateEntitySuccessfulResponse>;

export type GetEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type GetEntityRequest = never;
export type GetEntityResponse =
  operations['getEntity']['responses'][keyof operations['getEntity']['responses']]['content']['application/json'];
export type GetEntitySuccessfulResponse = operations['getEntity']['responses']['200']['content']['application/json'];
export type GetEntityFailureResponse = Exclude<GetEntityResponse, GetEntitySuccessfulResponse>;

export type UpdateEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type UpdateEntityRequest =
  operations['updateEntity']['requestBody'][keyof operations['updateEntity']['requestBody']]['application/json'];
export type UpdateEntityResponse =
  operations['updateEntity']['responses'][keyof operations['updateEntity']['responses']]['content']['application/json'];
export type UpdateEntitySuccessfulResponse =
  operations['updateEntity']['responses']['200']['content']['application/json'];
export type UpdateEntityFailureResponse = Exclude<UpdateEntityResponse, UpdateEntitySuccessfulResponse>;

export type DeleteEntityPathParams = paths[`/entities/{entity_id}`]['parameters']['path'];
export type DeleteEntityRequest = never;
export type DeleteEntityResponse =
  operations['deleteEntity']['responses'][keyof operations['deleteEntity']['responses']]['content']['application/json'];
export type DeleteEntitySuccessfulResponse =
  operations['deleteEntity']['responses']['204']['content']['application/json'];
export type DeleteEntityFailureResponse = Exclude<DeleteEntityResponse, DeleteEntitySuccessfulResponse>;

export type ListEntityMappingsPathParams = never;
export type ListEntityMappingsQueryParams = never;
export type ListEntityMappingsRequest = never;
export type ListEntityMappingsResponse =
  operations['listEntityMappings']['responses'][keyof operations['listEntityMappings']['responses']]['content']['application/json'];
export type ListEntityMappingsSuccessfulResponse =
  operations['listEntityMappings']['responses']['200']['content']['application/json'];
export type ListEntityMappingsFailureResponse = Exclude<
  ListEntityMappingsResponse,
  ListEntityMappingsSuccessfulResponse
>;

export type UpsertEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type UpsertEntityMappingRequest =
  operations['upsertEntityMapping']['requestBody']['content']['application/json'];
export type UpsertEntityMappingResponse =
  operations['upsertEntityMapping']['responses'][keyof operations['upsertEntityMapping']['responses']]['content']['application/json'];
export type UpsertEntityMappingSuccessfulResponse =
  operations['upsertEntityMapping']['responses']['200']['content']['application/json'];
export type UpsertEntityMappingFailureResponse = Exclude<
  UpsertEntityMappingResponse,
  UpsertEntityMappingSuccessfulResponse
>;

export type DeleteEntityMappingPathParams = paths['/entity_mappings/{entity_id}']['parameters']['path'];
export type DeleteEntityMappingRequest = never;
export type DeleteEntityMappingResponse = never;
export type DeleteEntityMappingSuccessfulResponse =
  operations['deleteEntityMapping']['responses']['204']['content']['application/json'];
export type DeleteEntityMappingFailureResponse = Exclude<
  DeleteEntityMappingResponse,
  DeleteEntityMappingSuccessfulResponse
>;

export type WebhookPayloads = {
  [K in keyof webhooks]: Exclude<webhooks[K]['post']['requestBody'], undefined>['content']['application/json'];
};

export type WebhookPayload = Exclude<
  webhooks[keyof webhooks]['post']['requestBody'],
  undefined
>['content']['application/json'];
export type WebhookType = keyof webhooks;
