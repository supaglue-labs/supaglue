import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  SequenceStartParams,
} from '@supaglue/types/engagement';
import { RemoteService } from './remote_service';

export class EngagementCommonModelService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async create<T extends EngagementCommonModelType>(
    type: T,
    connectionId: string,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    const remoteClient = await this.#remoteService.getEngagementRemoteClient(connectionId);
    return await remoteClient.createObject(type, params);
  }

  public async startSequence(connectionId: string, params: SequenceStartParams): Promise<void> {
    const remoteClient = await this.#remoteService.getEngagementRemoteClient(connectionId);
    return await remoteClient.startSequence(params);
  }
}
