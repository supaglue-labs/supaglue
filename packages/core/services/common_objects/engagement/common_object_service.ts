import { ConnectionSafeAny } from '@supaglue/types';
import { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from '@supaglue/types/engagement';
import { DestinationService } from '../../destination_service';
import { RemoteService } from '../../remote_service';

export class EngagementCommonObjectService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;

  public constructor(remoteService: RemoteService, destinationService: DestinationService) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
  }

  public async get<T extends EngagementCommonObjectType>(
    type: T,
    connectionId: string,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    const remoteClient = await this.#remoteService.getEngagementRemoteClient(connectionId);
    return await remoteClient.getCommonObjectRecord(type, id);
  }

  public async create<T extends EngagementCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = await this.#remoteService.getEngagementRemoteClient(connection.id);
    const id = await remoteClient.createCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, id);
      await writer.upsertCommonObjectRecord<'engagement', T>(connection, type, object);
    }

    return id;
  }

  public async update<T extends EngagementCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = await this.#remoteService.getEngagementRemoteClient(connection.id);
    await remoteClient.updateCommonObjectRecord(type, params);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, params.id);
      await writer.upsertCommonObjectRecord<'engagement', T>(connection, type, object);
    }
  }
}
