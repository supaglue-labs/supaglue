import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export abstract class AbstractNoCategoryRemoteClient extends AbstractRemoteClient implements RemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public async handleErr(err: unknown): Promise<unknown> {
    return err;
  }
}
