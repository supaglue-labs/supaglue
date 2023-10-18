import type { ConnectionSafeAny } from '@supaglue/types';
import type { Association, AssociationCreateParams, ListAssociationsParams } from '@supaglue/types/association';
import type { ConnectionService, RemoteService } from '.';
import { BadRequestError } from '../errors';

export class AssociationService {
  readonly #connectionService: ConnectionService;
  readonly #remoteService: RemoteService;

  public constructor(connectionService: ConnectionService, remoteService: RemoteService) {
    this.#connectionService = connectionService;
    this.#remoteService = remoteService;
  }

  public async listAssociations(connection: ConnectionSafeAny, params: ListAssociationsParams): Promise<Association[]> {
    if (!['hubspot', 'salesforce'].includes(connection.providerName)) {
      throw new BadRequestError(`Provider ${connection.providerName} does not support associations`);
    }
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    return await remoteClient.listAssociations(params);
  }

  public async createAssociation(connection: ConnectionSafeAny, params: AssociationCreateParams): Promise<Association> {
    if (!['hubspot', 'salesforce'].includes(connection.providerName)) {
      throw new BadRequestError(`Provider ${connection.providerName} does not support associations`);
    }
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    // TODO(SUP-682): Implement cache invalidation
    return await remoteClient.createAssociation(params);
  }
}
