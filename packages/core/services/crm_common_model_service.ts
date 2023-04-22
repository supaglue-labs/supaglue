import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { RemoteService } from './remote_service';

export class CRMCommonModelService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async create<T extends CRMCommonModelType>(
    type: T,
    connectionId: string,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createObject(type, params);
  }

  public async update<T extends CRMCommonModelType>(
    type: T,
    connectionId: string,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateObject(type, params);
  }
}
