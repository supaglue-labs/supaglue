import type { AssociationSchema, AssociationSchemaCreateParams } from '@supaglue/types/association_schema';
import type {
  CustomObjectSchema,
  CustomObjectSchemaCreateParams,
  CustomObjectSchemaUpdateParams,
  SimpleCustomObjectSchema,
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

  public async listCustomObjectSchemas(connectionId: string): Promise<SimpleCustomObjectSchema[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'list' });
    const result = await remoteClient.listCustomObjectSchemas();
    end();

    return result;
  }

  public async getCustomObjectSchema(connectionId: string, id: string): Promise<CustomObjectSchema> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'get' });
    const result = await remoteClient.getCustomObjectSchema(id);
    end();

    return result;
  }

  public async createCustomObjectSchema(connectionId: string, params: CustomObjectSchemaCreateParams): Promise<string> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'create' });
    const result = await remoteClient.createCustomObjectSchema(params);
    end();

    return result;
  }

  public async updateCustomObjectSchema(connectionId: string, params: CustomObjectSchemaUpdateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'update' });
    await remoteClient.updateCustomObjectSchema(params);
    end();
  }

  public async listAssociationSchemas(
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

  public async createAssociationSchema(
    connectionId: string,
    params: AssociationSchemaCreateParams
  ): Promise<AssociationSchema> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    return await remoteClient.createAssociationSchema(
      params.sourceObject,
      params.targetObject,
      params.keyName,
      params.displayName
    );
  }
}
