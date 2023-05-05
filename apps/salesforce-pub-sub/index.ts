import { getCoreDependencyContainer } from '@supaglue/core';
import { logger } from '@supaglue/core/lib/logger';
import { CDCChangeType, CDCWebhookPayload } from '@supaglue/types/cdc';
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

const salesforceChangeTypeToCDCChangeType = (changeType: string): CDCChangeType => {
  switch (changeType) {
    case 'CREATE':
    case 'UPDATE':
    case 'DELETE':
    case 'UNDELETE':
      return changeType;
    default:
      throw new Error(`Unknown changeType ${changeType}`);
  }
};

const { connectionService, integrationService } = getCoreDependencyContainer();
(async () => {
  const connections = await connectionService.listAllUnsafe({ providerName: 'salesforce' });

  for (const connection of connections) {
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

    let replayId: Uint8Array | undefined;

    const processStream = async (eventType: string, replayPreset = ReplayPreset.LATEST, replayId?: Uint8Array) => {
      // make sure we have the latest accessToken
      const { access_token: accessToken } = await conn.oauth2.refreshToken(refreshToken);
      // expiresAt is not returned from the refresh token response
      await connectionService.updateConnectionWithNewAccessToken(connectionId, accessToken, /* expiresAt */ null);

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
        replayId = latestReplayId;
        const { ChangeEventHeader, ...rest } = event;
        const { changeType, nulledFields, changedFields, diffFields, recordIds, entityName } = ChangeEventHeader;
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
            entityName,
            changeType: salesforceChangeTypeToCDCChangeType(changeType),
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
