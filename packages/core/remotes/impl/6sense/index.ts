import type {
  ConnectionUnsafe,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';
import axios from 'axios';
import { BadRequestError } from '../../../errors';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEnrichmentRemoteClient } from '../../categories/enrichment/base';
import type { LeadScoringAndFirmographicsResponse } from './mapper';
import { from6SenseLeadScoringAndFirmographicsResponseToPersonEnrichmentData } from './mapper';

class SixsenseClient extends AbstractEnrichmentRemoteClient {
  readonly #apiKey: string;

  public constructor(apiKey: string) {
    super('https://scribe.6sense.com');
    this.#apiKey = apiKey;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {};
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // not implemented because the baseURL changes based on the type of API, e.g.
    // https://scribe.6sense.com, or
    // https://epsilon.6sense.com
    throw new Error('Not implemented');
  }

  public override async enrichPerson(email: string): Promise<PersonEnrichmentData> {
    // TODO: This doesn't handle the 202 status code, which indicates that
    // the request is being processed asynchronously. We should handle that.
    // For now, the user should try again later.
    const response = await axios.post<LeadScoringAndFirmographicsResponse>(
      `${this.baseUrl}/v2/people/full`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.status !== 200) {
      throw new BadRequestError(`Unable to enrich person with email ${email}`);
    }

    return from6SenseLeadScoringAndFirmographicsResponseToPersonEnrichmentData(response.data);
  }
}

export function newClient(connection: ConnectionUnsafe<'6sense'>, provider: Provider): SixsenseClient {
  return new SixsenseClient(connection.credentials.apiKey);
}

// We are only supporting API Key based connections for 6Sense.
export const authConfig: ConnectorAuthConfig = {
  tokenHost: '',
  tokenPath: '',
  authorizeHost: '',
  authorizePath: '',
};
