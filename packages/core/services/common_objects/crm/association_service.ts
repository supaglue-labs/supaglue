import type { Association, AssociationCreateParams, ListAssociationsParams } from '@supaglue/types/crm/association';
import type { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
import type { RemoteService } from '../../remote_service';

export class CrmAssociationService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async getAssociationTypes(
    connectionId: string,
    sourceObject: SGObject,
    targetObject: SGObject
  ): Promise<AssociationType[]> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.getAssociationTypes(sourceObject, targetObject);
  }

  public async createAssociationType(connectionId: string, params: AssociationTypeCreateParams): Promise<void> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await remoteClient.createAssociationType(params);
  }

  public async listAssociations(connectionId: string, params: ListAssociationsParams): Promise<Association[]> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.listAssociations(params);
  }

  public async createAssociation(connectionId: string, params: AssociationCreateParams): Promise<Association> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createAssociation(params);
  }
}
