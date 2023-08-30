import type { ConnectionSafeAny } from '@supaglue/types';
import type { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from '@supaglue/types/engagement';
import { remoteDuration } from '../../../lib/metrics';
import type { DestinationService } from '../../destination_service';
import type { RemoteService } from '../../remote_service';

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
    const [remoteClient, providerName] = await this.#remoteService.getEngagementRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'get', remote_name: providerName });
    const obj = await remoteClient.getCommonObjectRecord(type, id);
    end();

    return obj;
  }

  public async create<T extends EngagementCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    const [remoteClient, providerName] = await this.#remoteService.getEngagementRemoteClient(connection.id);

    const end = remoteDuration.startTimer({ operation: 'create', remote_name: providerName });
    const id = await remoteClient.createCommonObjectRecord(type, params);
    end();

    // If the associated provider has a destination, do cache invalidation
    const [writer, destinationType] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer && connection.providerName !== 'apollo') {
      const object = await remoteClient.getCommonObjectRecord(type, id);

      const end = remoteDuration.startTimer({ operation: 'create', remote_name: destinationType! });
      await writer.upsertCommonObjectRecord<'engagement', T>(connection, type, object);
      end();
    }

    return id;
  }

  public async update<T extends EngagementCommonObjectType>(
    type: T,
    connection: ConnectionSafeAny,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<void> {
    const [remoteClient, providerName] = await this.#remoteService.getEngagementRemoteClient(connection.id);

    const end = remoteDuration.startTimer({ operation: 'update', remote_name: providerName });
    await remoteClient.updateCommonObjectRecord(type, params);
    end();

    // If the associated provider has a destination, do cache invalidation
    const [writer, destinationType] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer && connection.providerName !== 'apollo') {
      const object = await remoteClient.getCommonObjectRecord(type, params.id);

      const end = remoteDuration.startTimer({ operation: 'update', remote_name: destinationType! });
      await writer.upsertCommonObjectRecord<'engagement', T>(connection, type, object);
      end();
    }
  }
}
