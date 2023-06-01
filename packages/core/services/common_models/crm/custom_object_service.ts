import { CustomObject, CustomObjectCreateParams, CustomObjectUpdateParams } from '@supaglue/types/crm/custom_object';
import {
  CustomObjectClass,
  CustomObjectClassCreateParams,
  CustomObjectClassUpdateParams,
} from '@supaglue/types/crm/custom_object_class';
import { RemoteService } from '../..';
import { CrmRemoteClient } from '../../../remotes/crm/base';

// TODO: Should not be casting when getting RemoteClient

export class CrmCustomObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async getClass(connectionId: string, id: string): Promise<CustomObjectClass> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.getCustomObjectClass(id);
  }

  public async createClass(connectionId: string, params: CustomObjectClassCreateParams): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.createCustomObjectClass(params);
  }

  public async updateClass(connectionId: string, params: CustomObjectClassUpdateParams): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    await remoteClient.updateCustomObjectClass(params);
  }

  public async getObject(connectionId: string, classId: string, id: string): Promise<CustomObject> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.getCustomObject(classId, id);
  }

  public async createObject(connectionId: string, params: CustomObjectCreateParams): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.createCustomObject(params);
  }

  public async updateObject(connectionId: string, params: CustomObjectUpdateParams): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    await remoteClient.updateCustomObject(params);
  }
}
