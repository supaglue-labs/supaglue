import { CRMProvider } from '@supaglue/types';
import { ConnectionSafeAny } from '@supaglue/types/connection';
import { CRMCommonObjectType, CRMCommonObjectTypeMap } from '@supaglue/types/crm';
import { ProviderService, SchemaService } from '../..';
import { createFieldMappingConfig } from '../../../lib/schema';
import { CrmRemoteClient } from '../../../remotes/crm/base';
import { DestinationService } from '../../destination_service';
import { RemoteService } from '../../remote_service';

export class CrmCommonObjectService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;
  readonly #providerService: ProviderService;
  readonly #schemaService: SchemaService;

  public constructor(
    remoteService: RemoteService,
    destinationService: DestinationService,
    providerService: ProviderService,
    schemaService: SchemaService
  ) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
    this.#providerService = providerService;
    this.#schemaService = schemaService;
  }

  public async get<T extends CRMCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    id: string
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as CrmRemoteClient;
    const provider = await this.#providerService.getById<CRMProvider>(connection.providerId);
    const schemaId = provider.objects?.common?.find((o) => o.name === type)?.schemaId;
    const schema = schemaId ? await this.#schemaService.getById(schemaId) : undefined;
    const customerFieldMapping = connection.schemaMappingsConfig?.commonObjects?.find(
      (o) => o.object === type
    )?.fieldMappings;
    const fieldMappingConfig = createFieldMappingConfig(schema?.config, customerFieldMapping);

    return await remoteClient.getCommonObjectRecord(type, id, fieldMappingConfig);
  }

  public async create<T extends CRMCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as CrmRemoteClient;
    const id = await remoteClient.createCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await this.get(type, connection, id);
      await writer.upsertCommonObjectRecord<'crm', T>(connection, type, object);
    }

    return id;
  }

  public async update<T extends CRMCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as CrmRemoteClient;
    await remoteClient.updateCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await this.get(type, connection, params.id);
      await writer.upsertCommonObjectRecord<'crm', T>(connection, type, object);
    }
  }
}
