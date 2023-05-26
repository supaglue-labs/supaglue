import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { CrmRemoteClient } from '../../../remotes/crm/base';
import { RemoteService } from '../../remote_service';

export class CrmCommonModelService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async create<T extends CRMCommonModelType>(
    type: T,
    connectionId: string,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.createObject(type, params);
  }

  public async update<T extends CRMCommonModelType>(
    type: T,
    connectionId: string,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    await remoteClient.updateObject(type, params);
  }
}
