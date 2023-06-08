import { ConnectionSafeAny } from '@supaglue/types';
import { EngagementCommonModelType, EngagementCommonModelTypeMap } from '@supaglue/types/engagement';
import { EngagementRemoteClient } from '../../../remotes/engagement/base';
import { DestinationService } from '../../destination_service';
import { RemoteService } from '../../remote_service';

export class EngagementCommonModelService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;

  public constructor(remoteService: RemoteService, destinationService: DestinationService) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
  }

  public async get<T extends EngagementCommonModelType>(
    type: T,
    connectionId: string,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    return await remoteClient.getCommonModelRecord(type, id);
  }

  public async create<T extends EngagementCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as EngagementRemoteClient;
    const id = await remoteClient.createCommonModelRecord(type, params);

    // If the associated integration has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByIntegrationId(connection.integrationId);
    if (writer) {
      const object = await remoteClient.getCommonModelRecord(type, id);
      await writer.upsertCommonModelObject<'engagement', T>(connection, type, object);
    }

    return id;
  }

  public async update<T extends EngagementCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as EngagementRemoteClient;
    await remoteClient.updateCommonModelRecord(type, params);

    // If the associated integration has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByIntegrationId(connection.integrationId);
    if (writer) {
      const object = await remoteClient.getCommonModelRecord(type, params.id);
      await writer.upsertCommonModelObject<'engagement', T>(connection, type, object);
    }
  }
}
