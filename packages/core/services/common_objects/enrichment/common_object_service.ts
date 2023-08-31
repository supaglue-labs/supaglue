import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';
import { remoteDuration } from '../../../lib/metrics';
import type { RemoteService } from '../../remote_service';

export class EnrichmentCommonObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async enrichPerson(connectionId: string, email: string): Promise<PersonEnrichmentData> {
    const [remoteClient, providerName] = await this.#remoteService.getEnrichmentRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'enrichPerson', remote_name: providerName });
    const obj = await remoteClient.enrichPerson(email);
    end();

    return obj;
  }
}
