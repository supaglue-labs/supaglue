import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

const SUPPORTED_CRM_CONNECTIONS = ['salesforce', 'hubspot', 'pipedrive'];

dotenv.config({
  path: '/app/.env',
});
const prisma = new PrismaClient();

const {
  DEV_SALESFORCE_SCOPES,
  DEV_HUBSPOT_SCOPES,
  DEV_SALESFORCE_CLIENT_ID,
  DEV_SALESFORCE_CLIENT_SECRET,
  DEV_HUBSPOT_CLIENT_SECRET,
  DEV_HUBSPOT_CLIENT_ID,
  DEV_SALESFORCE_APP_ID,
  DEV_HUBSPOT_APP_ID,
  DEV_PIPEDRIVE_CLIENT_ID,
  DEV_PIPEDRIVE_CLIENT_SECRET,
  DEV_PIPEDRIVE_SCOPES,
  DEV_PIPEDRIVE_APP_ID,
  SUPAGLUE_SYNC_PERIOD_MS,
} = process.env;

const SALESFORCE_CUSTOMER_ID = '9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677';
const HUBSPOT_CUSTOMER_ID = 'ea3039fa-27de-4535-90d8-db2bab0c0252';
const SALESFORCE_INTEGRATION_ID = '9b725cc5-98f8-4cf7-bda4-c72242b456e2';
const HUBSPOT_INTEGRATION_ID = '7ba1d794-8b15-476e-b81a-790513c287e9';
const PIPEDRIVE_CUSTOMER_ID = 'eee222cf-6591-4195-a6da-a1b4a491fa8a';
const PIPEDRIVE_INTEGRATION_ID = 'cbf33d3c-f798-4321-842f-d6f9cf56a27c';
const OAUTH_CLIENT_IDS = [DEV_SALESFORCE_CLIENT_ID, DEV_HUBSPOT_CLIENT_ID, DEV_PIPEDRIVE_CLIENT_ID];
const OAUTH_CLIENT_SECRETS = [DEV_SALESFORCE_CLIENT_SECRET, DEV_HUBSPOT_CLIENT_SECRET, DEV_PIPEDRIVE_CLIENT_SECRET];
const OAUTH_SCOPES = [DEV_SALESFORCE_SCOPES, DEV_HUBSPOT_SCOPES, DEV_PIPEDRIVE_SCOPES];
const OAUTH_APP_IDS = [DEV_SALESFORCE_APP_ID, DEV_HUBSPOT_APP_ID, DEV_PIPEDRIVE_APP_ID];
const CUSTOMER_IDS = [SALESFORCE_CUSTOMER_ID, HUBSPOT_CUSTOMER_ID, PIPEDRIVE_CUSTOMER_ID];
const INTEGRATION_IDS = [SALESFORCE_INTEGRATION_ID, HUBSPOT_INTEGRATION_ID, PIPEDRIVE_INTEGRATION_ID];

async function seedCustomers() {
  // Create customers
  await Promise.all(
    CUSTOMER_IDS.map((id) =>
      prisma.customer.upsert({
        where: {
          id,
        },
        update: {},
        create: { id },
      })
    )
  );
}

async function seedCRMIntegrations() {
  // Create integrations
  await Promise.all(
    SUPPORTED_CRM_CONNECTIONS.map((_, idx) =>
      prisma.integration.upsert({
        where: {
          providerName: SUPPORTED_CRM_CONNECTIONS[idx],
        },
        update: {},
        create: {
          id: INTEGRATION_IDS[idx],
          category: 'crm',
          providerName: SUPPORTED_CRM_CONNECTIONS[idx],
          authType: 'oauth2',
          config: {
            providerNameAppId: OAUTH_APP_IDS[idx],
            oauth: {
              oauthScopes: OAUTH_SCOPES[idx]?.split(','),
              credentials: {
                oauthClientId: OAUTH_CLIENT_IDS[idx],
                oauthClientSecret: OAUTH_CLIENT_SECRETS[idx],
              },
            },
            sync: {
              period_ms: SUPAGLUE_SYNC_PERIOD_MS,
            },
          },
        },
      })
    )
  );
}

async function main() {
  await seedCustomers();
  await seedCRMIntegrations();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
