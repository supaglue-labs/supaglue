import { getCoreDependencyContainer } from '@supaglue/core';
import { logger } from '@supaglue/core/lib/logger';
import { CDCWebhookPayload } from '@supaglue/types/cdc';
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

const { connectionService, integrationService, webhookService, applicationService } = getCoreDependencyContainer();
(async () => {
  logger.info('Starting Salesforce CDC worker');
  const connections = await connectionService.listAllUnsafe({ providerName: 'salesforce' });

  for (const connection of connections) {
    const application = await applicationService.getById(connection.applicationId);

    const {
      credentials: { instanceUrl, refreshToken, loginUrl },
      id: connectionId,
    } = connection;

    const integration = await integrationService.getById(connection.integrationId);

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

    const processStream = async (eventType: string) => {
      let replayId: Uint8Array | undefined;
      let replayPreset = ReplayPreset.LATEST;
      // make sure we have the latest accessToken
      const { access_token: accessToken } = await conn.oauth2.refreshToken(refreshToken);
      // expiresAt is not returned from the refresh token response
      await connectionService.updateConnectionWithNewAccessToken(connectionId, accessToken, /* expiresAt */ null);

      // get the latest recorded replayId, if any
      const encodedReplayId = await webhookService.getReplayId(connectionId, eventType);
      if (encodedReplayId) {
        replayId = Uint8Array.from(Buffer.from(encodedReplayId, 'base64'));
        replayPreset = ReplayPreset.CUSTOM;
      }

      const { organization_id: tenantId } = await conn.identity();
      const client = await createClient({
        accessToken,
        instanceUrl,
        tenantId,
      });

      const stream = client.subscribe({
        topicName: `/data/${eventType}`,
        replayPreset,
        replayId,
        numRequested: 100,
      });
      for await (const { event, latestReplayId } of stream) {
        const { ChangeEventHeader, ...fields } = event;
        const { changeType, nulledFields, changedFields, diffFields, recordIds, entityName, transactionKey } =
          ChangeEventHeader;
        // skip gap events for now, since consumers wouldn't be able to do anything with them
        if (
          changeType === 'GAP_CREATE' ||
          changeType === 'GAP_DELETE' ||
          changeType === 'GAP_UPDATE' ||
          changeType === 'GAP_UNDELETE' ||
          changeType === 'GAP_OVERFLOW'
        ) {
          logger.info({ changeType, connectionId, eventType }, 'skipping gap event');
          continue;
        }
        for (const recordId of recordIds) {
          const webhookPayload: CDCWebhookPayload = {
            id: recordId,
            nulledFields,
            changedFields,
            diffFields,
            fields,
          };

          const eventName = `${entityName.toLowerCase()}.${changeType.toLowerCase()}`;

          await webhookService.sendMessage(eventName, webhookPayload, application, `${transactionKey}-${recordId}`);

          logger.debug({ webhookPayload, connectionId, eventType }, 'sent webhook');
        }

        await webhookService.saveReplayId(connectionId, eventType, Buffer.from(latestReplayId).toString('base64'));
      }
    };

    const subscribe = async (eventType: string) => {
      const streamErrorHandler = async (err: any) => {
        // TODO probably should do something a bit more sophisticated here

        if (err.message.startsWith('[not_found]')) {
          logger.warn(
            { err, connectionId, eventType },
            "can't start stream for event type since it doesn't exist, skipping"
          );
          return;
        }

        if (err.message.startsWith('[unauthenticated]') || err.message.startsWith('[permission_denied]')) {
          logger.error({ err, connectionId, eventType }, 'unrecoverable error starting stream, skipping');
          return;
        }

        logger.error({ err, connectionId, eventType }, 'error in stream, restarting');
        await processStream(eventType).catch(streamErrorHandler);
      };

      await processStream(eventType).catch(streamErrorHandler);
    };

    await Promise.all(
      EVENT_TYPES_TO_SUBSCRIBE_TO.flatMap(async (eventType) => {
        await subscribe(eventType);
      })
    );
  }
})().catch((error) => {
  logger.error(error, 'error caught in main');
  process.exit(1);
});
