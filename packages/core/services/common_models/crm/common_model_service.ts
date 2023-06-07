import { ConnectionSafeAny } from '@supaglue/types/connection';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { CrmRemoteClient } from '../../../remotes/crm/base';
import { DestinationService } from '../../destination_service';
import { RemoteService } from '../../remote_service';

export class CrmCommonModelService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;

  public constructor(remoteService: RemoteService, destinationService: DestinationService) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
  }

  public async get<T extends CRMCommonModelType>(
    type: T,
    connectionId: string,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.getCommonModelRecord(type, id);
  }

  public async create<T extends CRMCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as CrmRemoteClient;
    const id = await remoteClient.createCommonModelRecord(type, params);

    // If the associated integration has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByIntegrationId(connection.integrationId);
    if (writer) {
      const object = await remoteClient.getCommonModelRecord(type, id);
      await writer.upsertObject<'crm', T>(connection, type, object);
    }

    return id;
  }

  public async update<T extends CRMCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as CrmRemoteClient;
    await remoteClient.updateCommonModelRecord(type, params);

    // If the associated integration has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByIntegrationId(connection.integrationId);
    if (writer) {
      const object = await remoteClient.getCommonModelRecord(type, params.id);
      await writer.upsertObject<'crm', T>(connection, type, object);
    }
  }
}
