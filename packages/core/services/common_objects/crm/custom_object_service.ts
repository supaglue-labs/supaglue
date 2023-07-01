import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectUpdateParams,
} from '@supaglue/types/crm/custom_object';
import type {
  CustomObjectRecord,
  CustomObjectRecordCreateParams,
  CustomObjectRecordUpdateParams,
} from '@supaglue/types/crm/custom_object_record';
import type { RemoteService } from '../../remote_service';

// TODO: Should not be casting when getting RemoteClient

export class CrmCustomObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async getObject(connectionId: string, id: string): Promise<CustomObject> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.getCustomObject(id);
  }

  public async createObject(connectionId: string, params: CustomObjectCreateParams): Promise<string> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createCustomObject(params);
  }

  public async updateObject(connectionId: string, params: CustomObjectUpdateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await remoteClient.updateCustomObject(params);
  }

  public async getRecord(connectionId: string, objectId: string, id: string): Promise<CustomObjectRecord> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.getCustomObjectRecord(objectId, id);
  }

  public async createRecord(connectionId: string, params: CustomObjectRecordCreateParams): Promise<string> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createCustomObjectRecord(params);
  }

  public async updateRecord(connectionId: string, params: CustomObjectRecordUpdateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await remoteClient.updateCustomObjectRecord(params);
  }
}
