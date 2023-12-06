import * as crypto from 'crypto';
import type { Request, Response } from 'express';
import { Router } from 'express';

type HubspotChangedAssociationWebhookPayload = {
  eventId: string;
  subscriptionId: string;
  portalId: string;
  appId: string;
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

const CLIENT_SECRET = 'ccdf5c4f-40f2-43a3-8354-4f20bc5af1e7';

export default function init(app: Router): void {
  const webhookRouter = Router();

  webhookRouter.post('/_webhook', async (req: Request<HubspotChangedAssociationWebhookPayload>, res: Response) => {
    const validated = validateHubSpotSignatureV3(req);
    console.log(`validated: ${validated}`);
    console.log(`req.headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`req.body: ${JSON.stringify(req.body, null, 2)}`);
    return res.status(200).end();
  });

  app.use('/hubspot', webhookRouter);
}

function validateHubSpotSignatureV3(req: Request<HubspotChangedAssociationWebhookPayload>): boolean {
  const signature = req.headers['x-hubspot-signature-v3'] as string;
  const requestUri = req.protocol + '://' + req.get('host') + req.originalUrl;
  const requestBody = JSON.stringify(req.body);
  const timestamp = req.headers['x-hubspot-request-timestamp'] as string;
  // Check if the timestamp is older than 5 minutes
  const timestampDiff = Date.now() - parseInt(timestamp);
  console.log(`timestampDiff: ${timestampDiff}`);
  if (timestampDiff > 300000) {
    // 5 minutes in milliseconds
    return false;
  }

  console.log(`requestUri: ${requestUri}`);

  // Decode URL-encoded characters in requestUri
  const decodedUri = decodeURIComponent(requestUri);

  // The request method is always POST
  const requestMethod = 'POST';

  // Concatenate requestMethod, requestUri, requestBody, and timestamp
  const message = requestMethod + decodedUri + requestBody + timestamp;

  // Create HMAC SHA-256 hash
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(message);
  const hash = hmac.digest('base64');

  // Compare the hash with the signature
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
