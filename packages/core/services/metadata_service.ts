import type { AssociationType, AssociationTypeCreateParams } from '@supaglue/types/association_type';
import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectUpdateParams,
  SimpleCustomObject,
} from '@supaglue/types/custom_object';
import type { ConnectionService } from '.';
import { remoteDuration } from '../lib/metrics';
import type { RemoteService } from './remote_service';

export class MetadataService {
  readonly #remoteService: RemoteService;
  readonly #connectionService: ConnectionService;

  public constructor(remoteService: RemoteService, connectionService: ConnectionService) {
    this.#remoteService = remoteService;
    this.#connectionService = connectionService;
  }

  public async listStandardObjects(connectionId: string): Promise<string[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'list' });
    const result = await remoteClient.listStandardObjects();
    end();

    return result;
  }

  public async listCustomObjects(connectionId: string): Promise<SimpleCustomObject[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'list' });
    const result = await remoteClient.listCustomObjects();
    end();

    return result;
  }

  public async getCustomObject(connectionId: string, id: string): Promise<CustomObject> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'get' });
    const result = await remoteClient.getCustomObject(id);
    end();

    return result;
  }

  public async createCustomObject(connectionId: string, params: CustomObjectCreateParams): Promise<string> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'create' });
    const result = await remoteClient.createCustomObject(params);
    end();

    return result;
  }

  public async updateCustomObject(connectionId: string, params: CustomObjectUpdateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'update' });
    await remoteClient.updateCustomObject(params);
    end();
  }

  public async getAssociationTypes(
    connectionId: string,
    sourceEntityId: string,
    targetEntityId: string
  ): Promise<AssociationType[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    // TODO: We should only need to fetch the connection once, not twice
    const { object: sourceObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      sourceEntityId
    );
    const { object: targetObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      targetEntityId
    );
    const res = await remoteClient.listAssociationTypes(sourceObject, targetObject);
    return res.map((associationType) => ({
      id: associationType.id,
      displayName: associationType.displayName,
      cardinality: associationType.cardinality,
      sourceEntityId,
      targetEntityId,
    }));
  }

  public async createAssociationType(connectionId: string, params: AssociationTypeCreateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    // TODO: we should only need to fetch the connection once, not twice
    const { object: sourceObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.sourceEntityId
    );
    const { object: targetObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.targetEntityId
    );
    await remoteClient.createAssociationType(
      sourceObject,
      targetObject,
      params.keyName,
      params.displayName,
      params.cardinality
    );
  }
}
