import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export interface EnrichmentRemoteClient extends RemoteClient {
  enrichPerson(email: string): Promise<PersonEnrichmentData>;
}

export abstract class AbstractEnrichmentRemoteClient extends AbstractRemoteClient implements EnrichmentRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public async enrichPerson(email: string): Promise<PersonEnrichmentData> {
    throw new Error('Not implemented');
  }
}
