import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotFoundError } from '@supaglue/core/errors';
import { HUBSPOT_INSTANCE_URL_PREFIX, newClient } from '@supaglue/core/remotes/impl/hubspot/index';
import type { ConnectionUnsafe } from '@supaglue/types/connection';
import type { OauthProvider } from '@supaglue/types/provider';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';
import { Router } from 'express';

type HubspotChangedAssociationWebhookPayload = {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number; // Epoch timestamp
  subscriptionType: string;
  attemptNumber: number;
  changeSource: string;
  associationType: string;
  fromObjectId: number;
  toObjectId: number;
  associationRemoved: boolean;
  isPrimaryAssociation: boolean;
  sourceId?: string;
};

const { providerService, connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const webhookRouter = Router();

  webhookRouter.post(
    '/_webhook',
    async (req: Request<any, any, HubspotChangedAssociationWebhookPayload[]>, res: Response) => {
      try {
        await handleWebhook(req);
        res.status(200).send();
      } catch (e: any) {
        if (e.status === 400 || e.status === 401 || e.status === 403 || e.status === 404) {
          // Don't retry
          return res.status(200).send();
        }
        throw e;
      }
    }
  );

  app.use('/hubspot', webhookRouter);
}

async function handleWebhook(req: Request<any, any, HubspotChangedAssociationWebhookPayload[]>): Promise<void> {
  if (!req.body || !req.body.length) {
    return;
  }
  const { appId } = req.body[0];

  const provider = await providerService.findByHubspotAppId(appId.toString());
  if (!provider) {
    throw new BadRequestError(`Provider not found for appId: ${appId}`);
  }

  const validated = validateHubSpotSignatureV1(req, provider.config.oauth.credentials.oauthClientSecret);
  if (!validated) {
    throw new BadRequestError(`Invalid HubSpot signature`);
  }

  const uniquePortalIdsToPayloads = new Map<number, HubspotChangedAssociationWebhookPayload[]>();
  req.body.forEach((payload) => {
    if (uniquePortalIdsToPayloads.has(payload.portalId)) {
      uniquePortalIdsToPayloads.get(payload.portalId)?.push(payload);
    } else {
      uniquePortalIdsToPayloads.set(payload.portalId, [payload]);
    }
  });

  await Promise.all(
    Array.from(uniquePortalIdsToPayloads).map(([portalId, payloads]) => {
      return handleWebhookPayloadsForPortalId(portalId, payloads, provider);
    })
  );
}

function getObjectTypeFromPayload(payload: HubspotChangedAssociationWebhookPayload): 'contact' | 'company' | 'deal' {
  if (payload.associationType.startsWith('COMPANY')) {
    return 'company';
  }
  if (payload.associationType.startsWith('CONTACT')) {
    return 'contact';
  }
  if (payload.associationType.startsWith('DEAL')) {
    return 'deal';
  }
  throw new Error(`Unexpected associationType: ${payload.associationType}`);
}

async function handleWebhookPayloadsForPortalId(
  portalId: number,
  payloads: HubspotChangedAssociationWebhookPayload[],
  provider: OauthProvider
): Promise<void> {
  const instanceUrl = `${HUBSPOT_INSTANCE_URL_PREFIX}${portalId}`;
  const connection = await connectionService.findUnsafeByProviderIdAndInstanceUrl(provider.id, instanceUrl);
  if (!connection || connection.category !== 'crm') {
    throw new NotFoundError(`Connection not found for provider ${provider.id} and portalId: ${portalId}}`);
  }
  const client = newClient(connection as ConnectionUnsafe<'hubspot'>, provider);

  const objectTypeToDedupedIds = new Map<'contact' | 'company' | 'deal', Set<number>>();

  payloads.forEach((payload) => {
    const type = getObjectTypeFromPayload(payload);
    if (objectTypeToDedupedIds.has(type)) {
      objectTypeToDedupedIds.get(type)?.add(payload.fromObjectId);
    } else {
      objectTypeToDedupedIds.set(type, new Set([payload.fromObjectId]));
    }
  });
  const allPromises: Promise<void>[] = [];
  objectTypeToDedupedIds.forEach((ids, type) => {
    ids.forEach((id) => {
      allPromises.push(client.dirtyRecordForAssociations(type, id.toString()));
    });
  });
  await Promise.all(allPromises);
}

// Implemented as described in https://developers.hubspot.com/docs/api/webhooks/validating-requests#validate-requests-using-the-v1-request-signature
function validateHubSpotSignatureV1(req: Request, clientSecret: string): boolean {
  const signature = req.headers['x-hubspot-signature'] as string;
  const requestBody = JSON.stringify(req.body);
  const sourceString = clientSecret + requestBody;
  const hash = crypto.createHash('sha256').update(sourceString).digest('hex');

  // Compare the hash with the signature
  return hash === signature;
}

// Implemented as described in https://developers.hubspot.com/docs/api/webhooks/validating-requests#validate-the-v3-request-signature
// TODO: For some reason this fails when the request is routed through hookdeck
function validateHubSpotSignatureV3(req: Request, clientSecret: string): boolean {
  const signature = req.headers['x-hubspot-signature-v3'] as string;
  const requestUri = req.protocol + '://' + req.get('host') + req.originalUrl;
  const requestBody = JSON.stringify(req.body);
  const timestamp = req.headers['x-hubspot-request-timestamp'] as string;
  // Check if the timestamp is older than 5 minutes
  const timestampDiff = Date.now() - parseInt(timestamp);
  if (timestampDiff > 300000) {
    // 5 minutes in milliseconds
    return false;
  }

  // Decode URL-encoded characters in requestUri
  const decodedUri = decodeURIComponent(requestUri);

  // The request method is always POST
  const requestMethod = 'POST';

  // Concatenate requestMethod, requestUri, requestBody, and timestamp
  const message = requestMethod + decodedUri + requestBody + timestamp;

  // Create HMAC SHA-256 hash
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  const hash = hmac.digest('base64');

  // Compare the hash with the signature
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
