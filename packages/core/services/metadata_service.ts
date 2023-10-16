import type { AssociationSchema, AssociationSchemaCreateParams } from '@supaglue/types/association_schema';
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

  public async getAssociationSchemas(
    connectionId: string,
    sourceObject: string,
    targetObject: string
  ): Promise<AssociationSchema[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    // TODO: We should only need to fetch the connection once, not twice
    const res = await remoteClient.listAssociationSchemas(sourceObject, targetObject);
    return res.map((associationSchema) => ({
      id: associationSchema.id,
      displayName: associationSchema.displayName,
      sourceObject,
      targetObject,
    }));
  }

  public async createAssociationSchema(connectionId: string, params: AssociationSchemaCreateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    await remoteClient.createAssociationSchema(
      params.sourceObject,
      params.targetObject,
      params.keyName,
      params.displayName
    );
  }
}
