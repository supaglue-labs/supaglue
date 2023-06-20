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
    return await remoteClient.getCommonObjectRecord(type, id);
  }

  public async create<T extends EngagementCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as EngagementRemoteClient;
    const id = await remoteClient.createCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, id);
      await writer.upsertCommonModelRecord<'engagement', T>(connection, type, object);
    }

    return id;
  }

  public async update<T extends EngagementCommonModelType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connection.id)) as EngagementRemoteClient;
    await remoteClient.updateCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, params.id);
      await writer.upsertCommonModelRecord<'engagement', T>(connection, type, object);
    }
  }
}
