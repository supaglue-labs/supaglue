import { Client as HubspotClient } from '@hubspot/api-client';
import type { SubscriptionCreateRequestEventTypeEnum } from '@hubspot/api-client/lib/codegen/webhooks';
import { BadRequestError } from '../errors';

const HUBSPOT_WEBHOOK_TARGET_URL =
  process.env.HUBSPOT_WEBHOOK_TARGET_URL ?? `${process.env.SUPAGLUE_SERVER_URL}/internal/hubspot/_webhook`;

export const updateWebhookSubscriptions = async (
  developerApiKey: string,
  hubspotAppId: number,
  hubspotStandardObjects: ('contact' | 'company' | 'deal')[]
) => {
  const hubspotClient = new HubspotClient({ developerApiKey });
  const subscriptions = await hubspotClient.webhooks.subscriptionsApi.getAll(hubspotAppId);

  await Promise.all(
    ['company.associationChange', 'contact.associationChange', 'deal.associationChange'].map(async (eventType) => {
      const existingSubscription = subscriptions.results?.find((s) => s.eventType === eventType);
      if (!hubspotStandardObjects.includes(eventType.split('.')[0] as 'contact' | 'company' | 'deal')) {
        // Delete the subscription if it exists
        if (!existingSubscription) {
          return;
        }
        await hubspotClient.webhooks.subscriptionsApi.archive(parseInt(existingSubscription.id), hubspotAppId);
        return;
      }
      // Create subscription if it doesn't exist
      if (!existingSubscription) {
        return hubspotClient.webhooks.subscriptionsApi.create(hubspotAppId, {
          active: true,
          eventType: eventType as SubscriptionCreateRequestEventTypeEnum,
        });
      }
    })
  );
};

export const deleteWebhookSubscriptions = async (developerApiKey: string, hubspotAppId: number) => {
  const hubspotClient = new HubspotClient({ developerApiKey });
  const subscriptions = await hubspotClient.webhooks.subscriptionsApi.getAll(hubspotAppId);
  await Promise.all(
    (subscriptions.results ?? []).map((subscription) =>
      hubspotClient.webhooks.subscriptionsApi.archive(parseInt(subscription.id), hubspotAppId)
    )
  );
};

const checkWebhookTargetExists = async (hubspotClient: HubspotClient, hubspotAppId: number): Promise<boolean> => {
  try {
    const res = await hubspotClient.webhooks.settingsApi.getAll(hubspotAppId);
    if (res.targetUrl === HUBSPOT_WEBHOOK_TARGET_URL) {
      return true;
    }
    throw new BadRequestError(
      `Your Hubspot Developer App already has an existing Webhook target URL. Please delete it first or use a different app.`
    );
  } catch (e: any) {
    if (e.code === 404) {
      return false;
    }
    throw e;
  }
};

export const createWebhookTargetIfNoneExists = async (developerApiKey: string, hubspotAppId: number) => {
  const hubspotClient = new HubspotClient({ developerApiKey });
  const exists = await checkWebhookTargetExists(hubspotClient, hubspotAppId);
  if (!exists) {
    await hubspotClient.webhooks.settingsApi.configure(hubspotAppId, {
      throttling: {
        period: 'SECONDLY',
        maxConcurrentRequests: 10,
      },
      targetUrl: HUBSPOT_WEBHOOK_TARGET_URL,
    });
  }
};

export const deleteWebhookTargetIfExists = async (developerApiKey: string, hubspotAppId: number) => {
  const hubspotClient = new HubspotClient({ developerApiKey });
  await hubspotClient.webhooks.settingsApi.clear(hubspotAppId);
};
