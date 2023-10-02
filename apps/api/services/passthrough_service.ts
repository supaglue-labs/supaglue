import { addLogContext } from '@supaglue/core/lib';
import type { RemoteService } from '@supaglue/core/services/remote_service';
import type { SendPassthroughRequestRequest, SendPassthroughRequestResponse } from '@supaglue/types/passthrough';

export class PassthroughService {
  #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async send(
    connectionId: string,
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    const client = await this.#remoteService.getRemoteClient(connectionId);
    // TODO I don't think this is actually working right now. Not seeing any context on successful request logs
    //      and error logs are missing this key. Figure out why
    addLogContext('passthroughRequest', {
      path: request.path,
      method: request.method,
    });
    return await client.sendPassthroughRequest(request);
  }
}
