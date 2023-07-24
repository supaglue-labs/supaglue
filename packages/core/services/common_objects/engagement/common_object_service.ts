import type { ConnectionSafeAny } from '@supaglue/types';
import type { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from '@supaglue/types/engagement';
import { Histogram } from 'prom-client';
import type { DestinationService } from '../../destination_service';
import type { RemoteService } from '../../remote_service';

const histogram = new Histogram({
  name: 'remote_operation_duration_seconds',
  help: 'remote operation duration in seconds',
  labelNames: ['operation', 'remote_name'],
});

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

    const end = histogram.startTimer({ operation: 'get', remote_name: providerName });
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

    const end = histogram.startTimer({ operation: 'create', remote_name: providerName });
    const id = await remoteClient.createCommonObjectRecord(type, params);
    end();

    // If the associated provider has a destination, do cache invalidation
    const [writer, destinationType] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, id);

      const end = histogram.startTimer({ operation: 'create', remote_name: destinationType! });
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

    const end = histogram.startTimer({ operation: 'update', remote_name: providerName });
    await remoteClient.updateCommonObjectRecord(type, params);
    end();

    // If the associated provider has a destination, do cache invalidation
    const [writer, destinationType] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await remoteClient.getCommonObjectRecord(type, params.id);

      const end = histogram.startTimer({ operation: 'update', remote_name: destinationType! });
      await writer.upsertCommonObjectRecord<'engagement', T>(connection, type, object);
      end();
    }
  }
}
