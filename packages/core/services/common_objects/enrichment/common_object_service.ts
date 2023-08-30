import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';
import { Histogram } from 'prom-client';
import type { RemoteService } from '../../remote_service';

const histogram = new Histogram({
  name: 'remote_operation_duration_seconds',
  help: 'remote operation duration in seconds',
  labelNames: ['operation', 'remote_name'],
});

export class EnrichmentCommonObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async enrichPerson(connectionId: string, email: string): Promise<PersonEnrichmentData> {
    const [remoteClient, providerName] = await this.#remoteService.getEnrichmentRemoteClient(connectionId);

    const end = histogram.startTimer({ operation: 'enrichPerson', remote_name: providerName });
    const obj = await remoteClient.enrichPerson(email);
    end();

    return obj;
  }
}
