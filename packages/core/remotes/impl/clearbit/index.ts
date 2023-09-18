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
import type { CombinedAPIResponse } from './mapper';
import { fromClearbitCombinedAPIResponseToPersonEnrichmentData } from './mapper';

class ClearbitClient extends AbstractEnrichmentRemoteClient {
  readonly #apiKey: string;

  public constructor(apiKey: string) {
    super('https://person.clearbit.com');
    this.#apiKey = apiKey;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {};
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // not implemented because the baseURL changes based on the type of API, e.g.
    // https://person.clearbit.com, or
    // https://discovery.clearbit.com
    throw new Error('Not implemented');
  }

  public override async enrichPerson(email: string): Promise<PersonEnrichmentData> {
    // TODO: This doesn't handle the 202 status code, which indicates that
    // the request is being processed asynchronously. We should handle that.
    // For now, the user should try again later.
    const response = await axios.get<CombinedAPIResponse>(`${this.baseUrl}/v2/combined/find`, {
      params: {
        email,
      },
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
      },
    });

    if (response.status !== 200) {
      throw new BadRequestError(`Unable to enrich person with email ${email}`);
    }

    return fromClearbitCombinedAPIResponseToPersonEnrichmentData(response.data);
  }
}

export function newClient(connection: ConnectionUnsafe<'clearbit'>, provider: Provider): ClearbitClient {
  return new ClearbitClient(connection.credentials.apiKey);
}

// We are only supporting API Key based connections for Clearbit.
export const authConfig: ConnectorAuthConfig = {
  tokenHost: '',
  tokenPath: '',
  authorizeHost: '',
  authorizePath: '',
};
