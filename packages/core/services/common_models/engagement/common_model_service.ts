import { EngagementCommonModelType, EngagementCommonModelTypeMap } from '@supaglue/types/engagement';
import { EngagementRemoteClient } from '../../../remotes/engagement/base';
import { RemoteService } from '../../remote_service';

export class EngagementCommonModelService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async get<T extends EngagementCommonModelType>(
    type: T,
    connectionId: string,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    throw new Error('Unimplemented');
    // const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    // return await remoteClient.getObject(type, id);
  }

  public async create<T extends EngagementCommonModelType>(
    type: T,
    connectionId: string,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    await remoteClient.createObject(type, params);
  }

  public async update<T extends EngagementCommonModelType>(
    type: T,
    connectionId: string,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    await remoteClient.updateObject(type, params);
  }
}
