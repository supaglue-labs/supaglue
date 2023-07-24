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
import { remoteDuration } from '../../../lib/metrics';
import type { RemoteService } from '../../remote_service';

// TODO: Should not be casting when getting RemoteClient

export class CrmCustomObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async getObject(connectionId: string, id: string): Promise<CustomObject> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'get', remote_name: providerName });
    const result = await remoteClient.getCustomObject(id);
    end();

    return result;
  }

  public async createObject(connectionId: string, params: CustomObjectCreateParams): Promise<string> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'create', remote_name: providerName });
    const result = await remoteClient.createCustomObject(params);
    end();

    return result;
  }

  public async updateObject(connectionId: string, params: CustomObjectUpdateParams): Promise<void> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'update', remote_name: providerName });
    await remoteClient.updateCustomObject(params);
    end();
  }

  public async getRecord(connectionId: string, objectId: string, id: string): Promise<CustomObjectRecord> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'get', remote_name: providerName });
    const result = await remoteClient.getCustomObjectRecord(objectId, id);
    end();

    return result;
  }

  public async createRecord(connectionId: string, params: CustomObjectRecordCreateParams): Promise<string> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'create', remote_name: providerName });
    const result = await remoteClient.createCustomObjectRecord(params);
    end();

    return result;
  }

  public async updateRecord(connectionId: string, params: CustomObjectRecordUpdateParams): Promise<void> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'update', remote_name: providerName });
    await remoteClient.updateCustomObjectRecord(params);
    end();
  }
}
