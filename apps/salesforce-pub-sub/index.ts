import { getCoreDependencyContainer } from '@supaglue/core';
import { logger } from '@supaglue/core/lib/logger';
import * as jsforce from 'jsforce';
import { createClient } from './client';
import { ReplayPreset } from './gen/pubsub_api_pb';

const EVENT_TYPES_TO_SUBSCRIBE_TO = [
  'AccountChangeEvent',
  'ContactChangeEvent',
  'LeadChangeEvent',
  'OpportunityChangeEvent',
  'EventChangeEvent',
  'UserChangeEvent',
];

const { connectionService, integrationService } = getCoreDependencyContainer();
(async () => {
  const connections = await connectionService.listAllUnsafe({ providerName: 'salesforce' });

  for (const connection of connections) {
    const {
      credentials: { instanceUrl, refreshToken, loginUrl },
      id: connectionId,
    } = connection;

    const integration = await integrationService.getById(connection.integrationId);

    logger.debug('setting up jsforce connection');
    const conn = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        loginUrl,
        clientId: integration.config.oauth.credentials.oauthClientId,
        clientSecret: integration.config.oauth.credentials.oauthClientSecret,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
    });

    // make sure we have the latest accessToken
    const { access_token: accessToken } = await conn.oauth2.refreshToken(refreshToken);
    const { organization_id: tenantId } = await conn.identity();

    const client = await createClient({
      accessToken,
      instanceUrl,
      tenantId,
    });

    let replayId: Uint8Array | undefined;

    const processStream = async (eventType: string, replayPreset = ReplayPreset.LATEST, replayId?: Uint8Array) => {
      logger.debug({ connectionId, eventType }, 'setting up stream');
      const stream = client.subscribe({
        topicName: `/data/${eventType}`,
        replayPreset,
        replayId,
        numRequested: 100,
      });
      for await (const { event, latestReplayId } of stream) {
        replayId = latestReplayId;
        logger.debug({ event, eventType }, 'received event');
        const { ChangeEventHeader, ...rest } = event;
        const { changeType, nulledFields, changedFields, diffFields, recordIds } = ChangeEventHeader;
        for (const recordId of recordIds) {
          const webhookPayload = {
            id: recordId,
            changeType,
            nulledFields,
            changedFields,
            diffFields,
            ...rest,
          };

          logger.info(
            { webhookPayload, connectionId, eventType, latestReplayId: Buffer.from(latestReplayId).toString('base64') },
            'sending webhook'
          );
        }
      }
    };

    const subscribe = (eventType: string) => {
      const streamErrorHandler = (err: any) => {
        // TODO probably should do something a bit more sophisticated here
        logger.error({ err, connectionId, eventType }, 'error in stream, restarting');
        processStream(eventType, ReplayPreset.CUSTOM, replayId).catch(streamErrorHandler);
      };

      processStream(eventType).catch(streamErrorHandler);
    };

    EVENT_TYPES_TO_SUBSCRIBE_TO.forEach((eventType) => {
      subscribe(eventType);
    });
  }
})().catch((error) => {
  logger.error(error, 'error caught in main');
  process.exit(1);
});
