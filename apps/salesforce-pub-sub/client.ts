import type { PromiseClient } from '@bufbuild/connect';
import { createPromiseClient } from '@bufbuild/connect';
// @ts-expect-error this is an ESM module, but we are only using the types
import type { PartialMessage } from '@bufbuild/protobuf';
import { logger } from '@supaglue/core/lib/logger';
import type { types } from 'avsc';
import { parse } from 'avsc';
import { LRUCache } from 'lru-cache';
import { Readable } from 'stream';
import { PubSub } from './gen/pubsub_api_connect';
import type { FetchRequest, ReplayPreset } from './gen/pubsub_api_pb';
import { parseEvent } from './parser';

// Salesforce's keepalive mechanic delivers an empty event every 270 seconds,
// so if we haven't recieved anything by 5 minutes something is wrong.
// We should be good with timing out at that point
// Ref: https://developer.salesforce.com/docs/platform/pub-sub-api/references/methods/subscribe-rpc.html#subscribe-keepalive-behavior
const SUBSCRIBE_TIMEOUT_MS = 300_000;

type FetchRequestWithRequiredFields = PartialMessage<FetchRequest> & {
  topicName: string;
  replayPreset: ReplayPreset;
  numRequested: number;
};

export class PubSubClient {
  private grpcClient: PromiseClient<typeof PubSub>;
  private schemas: LRUCache<string, types.RecordType> = new LRUCache({
    max: 10000,
  });

  constructor({ grpcClient }: { grpcClient: PromiseClient<typeof PubSub> }) {
    this.grpcClient = grpcClient;
  }

  private async getSchema(schemaId: string) {
    let schema = this.schemas.get(schemaId);
    if (!schema) {
      const schemaRequest = {
        schemaId,
      };
      const schemaResponse = await this.grpcClient.getSchema(schemaRequest);
      const { schemaJson } = schemaResponse;
      schema = parse(schemaJson);
      this.schemas.set(schemaId, schema);
    }
    return schema;
  }

  async *subscribe(fetchRequest: FetchRequestWithRequiredFields) {
    const requestStream = new Readable({ objectMode: true });

    const stream = this.grpcClient.subscribe(requestStream, {
      timeoutMs: SUBSCRIBE_TIMEOUT_MS,
    });

    for await (const response of stream) {
      for (const eventEnvelope of response.events) {
        const { event } = eventEnvelope;
        if (!event) {
          continue;
        }
        const { schemaId, payload } = event;
        const schema = await this.getSchema(schemaId);
        if (!schema) {
          logger.warn(`Failed to get schema for ${schemaId}`);
          continue;
        }

        yield {
          event: parseEvent(schema, Buffer.from(payload)),
          latestReplayId: response.latestReplayId,
        };
      }

      if (response.pendingNumRequested === 0) {
        requestStream.push(fetchRequest);
      }
    }
  }
}

export async function createClient({
  accessToken,
  instanceUrl,
  tenantId,
}: {
  accessToken: string;
  instanceUrl: string;
  tenantId: string;
}) {
  // this is an ESM module, so it must be imported dynamically
  const { createGrpcTransport } = await import('@bufbuild/connect-node');
  const transport = createGrpcTransport({
    httpVersion: '2',
    // TODO: support the european instance
    baseUrl: 'https://api.pubsub.salesforce.com:443',
    keepSessionAlive: true,
    interceptors: [
      (next) => async (req) => {
        req.header.append('accesstoken', accessToken);
        req.header.append('instanceurl', instanceUrl);
        req.header.append('tenantid', tenantId);

        return await next(req);
      },
    ],
  });
  const grpcClient = createPromiseClient(PubSub, transport);

  return new PubSubClient({ grpcClient });
}
