import { credentials } from '@supaglue/grpc/grpc-js';
import { PubSubClient } from '@supaglue/grpc/pubsub_api_grpc_pb';
import { FetchRequest, FetchResponse, SchemaRequest, TopicRequest } from '@supaglue/grpc/pubsub_api_pb';
import * as avro from 'avsc';
import { EventEmitter } from 'events';
import jsforce from 'jsforce';
import { getDependencyContainer } from '../dependency_container';
import { logger } from '../logger';
import { decodeReplayId, parseEvent } from './event_parser';

const SALESFORCE_PUB_SUB_ENDPOINT = process.env.SALESFORCE_PUB_SUB_ENDPOINT ?? 'api.pubsub.salesforce.com:443';

const clientCache = new Map<string, PubSubClient>();
const schemaCache = new Map<string, { id: string; type: avro.types.RecordType }>();

const { integrationService, developerConfigService } = getDependencyContainer();

export async function getClient(customerId: string) {
  if (clientCache.has(customerId)) {
    return clientCache.get(customerId)!;
  }

  const { accessToken, instanceUrl, organizationId } = await getCredentials(customerId);

  if (!accessToken) {
    throw new Error(`Unable to fetch access token`);
  }

  logger.info(`Connecting to Salesforce PubSub endpoint: ${SALESFORCE_PUB_SUB_ENDPOINT}`);
  const client = new PubSubClient(SALESFORCE_PUB_SUB_ENDPOINT, credentials.createSsl(), {
    callInvocationTransformer: (callProperties) => {
      callProperties.metadata.add('accesstoken', accessToken);
      callProperties.metadata.add('instanceurl', instanceUrl);
      callProperties.metadata.add('tenantid', organizationId);

      return callProperties;
    },
  });
  clientCache.set(customerId, client);
  return client;
}

export async function getSchema({
  customerId,
  schemaId,
}: {
  customerId: string;
  schemaId: string;
}): Promise<{ id: string; type: avro.types.RecordType }> {
  if (schemaCache.has(schemaId)) {
    return schemaCache.get(schemaId)!;
  }

  const client = await getClient(customerId);

  return new Promise((resolve, reject) => {
    const schemaRequest = new SchemaRequest().setSchemaId(schemaId);
    client.getSchema(schemaRequest, (err, res) => {
      if (err) {
        reject(err);
      } else {
        try {
          const type = avro.Type.forSchema(JSON.parse(res.getSchemaJson())) as avro.types.RecordType;

          const value = { id: schemaId, type };
          schemaCache.set(schemaId, value);
          resolve(value);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}

export async function getSchemaForTopic({
  topicName,
  customerId,
}: {
  topicName: string;
  customerId: string;
}): Promise<{ id: string; type: avro.Type }> {
  const client = await getClient(customerId);

  return new Promise((resolve, reject) => {
    const topicRequest = new TopicRequest().setTopicName(topicName);
    client.getTopic(topicRequest, (err, res) => {
      if (err) {
        return reject(err);
      } else {
        const schemaId = res.getSchemaId();
        if (!schemaId) {
          return reject(new Error(`No schemaId found for topic ${topicName}`));
        }
        resolve(getSchema({ customerId, schemaId }));
      }
    });
  });
}

export async function subscribe({ topicName, customerId }: { topicName: string; customerId: string }) {
  const client = await getClient(customerId);

  const subscription = client.subscribe();
  // cache the schema we are expecting
  await getSchemaForTopic({ topicName, customerId });
  const fetchRequest = new FetchRequest().setTopicName(topicName).setNumRequested(1000);
  subscription.write(fetchRequest);

  // Listen to new events
  const eventEmitter = new EventEmitter();
  subscription.on('data', (data: FetchResponse) => {
    const events = data.getEventsList();
    const latestReplayId = decodeReplayId(Buffer.from(data.getLatestReplayId()));
    logger.debug(`Received ${events.length} events, latest replay ID: ${latestReplayId}`);
    Promise.all(
      events.map(async (event) => {
        const parsedEvent = await parseEvent(event, customerId);
        logger.info(JSON.stringify(parsedEvent, null, 2));
        eventEmitter.emit('data', parsedEvent);
      })
    );
  });
  subscription.on('end', () => {
    logger.info('gRPC stream ended');
    eventEmitter.emit('end');
  });
  subscription.on('error', (error) => {
    logger.error(`gRPC stream error: ${JSON.stringify(error)}`);
    eventEmitter.emit('error', error);
  });
  subscription.on('status', (status) => {
    logger.info(`gRPC stream status: ${status}`);
    eventEmitter.emit('status', status);
  });
  return eventEmitter;
}

async function getCredentials(customerId: string) {
  const {
    credentials: { refreshToken, instanceUrl, organizationId },
  } = await integrationService.getByCustomerIdAndType(customerId, 'salesforce', true);
  const developerConfig = await developerConfigService.getDeveloperConfig();

  const oauth2 = new jsforce.OAuth2({
    ...developerConfig.getSalesforceCredentials(),
    redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
  });

  const connection = new jsforce.Connection({ oauth2, loginUrl: oauth2.loginUrl, refreshToken });
  const { access_token: accessToken } = await connection.oauth2.refreshToken(refreshToken);

  return { accessToken, instanceUrl, organizationId };
}
