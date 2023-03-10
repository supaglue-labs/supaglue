import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

const SUPPORTED_CRM_CONNECTIONS = [
  'salesforce',
  'hubspot',
  'pipedrive',
  'zendesk_sell',
  'ms_dynamics_365_sales',
  'zoho_crm',
  'capsule',
];

dotenv.config({
  path: '/app/.env',
});
const prisma = new PrismaClient();

const {
  SUPAGLUE_SYNC_PERIOD_MS,
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
  DEV_ZENDESK_SELL_CLIENT_ID,
  DEV_ZENDESK_SELL_CLIENT_SECRET,
  DEV_ZENDESK_SELL_SCOPES,
  DEV_ZENDESK_SELL_APP_ID,
  DEV_MS_DYNAMICS_365_SALES_CLIENT_ID,
  DEV_MS_DYNAMICS_365_SALES_CLIENT_SECRET,
  DEV_MS_DYNAMICS_365_SALES_SCOPES,
  DEV_MS_DYNAMICS_365_SALES_APP_ID,
  DEV_ZOHO_CRM_CLIENT_ID,
  DEV_ZOHO_CRM_CLIENT_SECRET,
  DEV_ZOHO_CRM_SCOPES,
  DEV_ZOHO_CRM_APP_ID,
  DEV_CAPSULE_CLIENT_ID,
  DEV_CAPSULE_CLIENT_SECRET,
  DEV_CAPSULE_SCOPES,
  DEV_CAPSULE_APP_ID,
} = process.env;

const APPLICATION_ID = 'a4398523-03a2-42dd-9681-c91e3e2efaf4';

const SALESFORCE_CUSTOMER_ID = '9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677';
const HUBSPOT_CUSTOMER_ID = 'ea3039fa-27de-4535-90d8-db2bab0c0252';
const SALESFORCE_INTEGRATION_ID = '9b725cc5-98f8-4cf7-bda4-c72242b456e2';
const HUBSPOT_INTEGRATION_ID = '7ba1d794-8b15-476e-b81a-790513c287e9';
const PIPEDRIVE_CUSTOMER_ID = 'eee222cf-6591-4195-a6da-a1b4a491fa8a';
const PIPEDRIVE_INTEGRATION_ID = 'cbf33d3c-f798-4321-842f-d6f9cf56a27c';
const ZENDESK_SELL_CUSTOMER_ID = 'c46667c3-fc64-4d92-9c89-582fb2ca6de1';
const ZENDESK_SELL_INTEGRATION_ID = '767619f8-ecc9-487a-97f9-1e06f3702d4f';
const MS_DYNAMICS_365_SELL_CUSTOMER_ID = '1d2c8f45-42df-44be-a18a-414cbbf5a8ec';
const MS_DYNAMICS_365_SELL_INTEGRATION_ID = '59c80887-9326-43bd-bf66-dc6bd07f0a96';
const ZOHO_CRM_CUSTOMER_ID = '313a5e13-5db8-44fb-b6b7-06a23e5fe25a';
const ZOHO_CRM_INTEGRATION_ID = 'a86d14f9-d0ec-4e10-bdf1-65fafbd771d2';
const CAPSULE_CUSTOMER_ID = 'e523cd5a-e044-4593-981b-ef07fc7a7f09';
const CAPSULE_INTEGRATION_ID = 'f7e8ea69-f19d-4b61-8301-c1dd791757c4';

const OAUTH_CLIENT_IDS = [
  DEV_SALESFORCE_CLIENT_ID,
  DEV_HUBSPOT_CLIENT_ID,
  DEV_PIPEDRIVE_CLIENT_ID,
  DEV_ZENDESK_SELL_CLIENT_ID,
  DEV_MS_DYNAMICS_365_SALES_CLIENT_ID,
  DEV_ZOHO_CRM_CLIENT_ID,
  DEV_CAPSULE_CLIENT_ID,
];
const OAUTH_CLIENT_SECRETS = [
  DEV_SALESFORCE_CLIENT_SECRET,
  DEV_HUBSPOT_CLIENT_SECRET,
  DEV_PIPEDRIVE_CLIENT_SECRET,
  DEV_ZENDESK_SELL_CLIENT_SECRET,
  DEV_MS_DYNAMICS_365_SALES_CLIENT_SECRET,
  DEV_ZOHO_CRM_CLIENT_SECRET,
  DEV_CAPSULE_CLIENT_SECRET,
];
const OAUTH_SCOPES = [
  DEV_SALESFORCE_SCOPES,
  DEV_HUBSPOT_SCOPES,
  DEV_PIPEDRIVE_SCOPES,
  DEV_ZENDESK_SELL_SCOPES,
  DEV_MS_DYNAMICS_365_SALES_SCOPES,
  DEV_ZOHO_CRM_SCOPES,
  DEV_CAPSULE_SCOPES,
];
const OAUTH_APP_IDS = [
  DEV_SALESFORCE_APP_ID,
  DEV_HUBSPOT_APP_ID,
  DEV_PIPEDRIVE_APP_ID,
  DEV_ZENDESK_SELL_APP_ID,
  DEV_MS_DYNAMICS_365_SALES_APP_ID,
  DEV_ZOHO_CRM_APP_ID,
  DEV_CAPSULE_APP_ID,
];
const CUSTOMER_IDS = [
  SALESFORCE_CUSTOMER_ID,
  HUBSPOT_CUSTOMER_ID,
  PIPEDRIVE_CUSTOMER_ID,
  ZENDESK_SELL_CUSTOMER_ID,
  MS_DYNAMICS_365_SELL_CUSTOMER_ID,
  ZOHO_CRM_CUSTOMER_ID,
  CAPSULE_CUSTOMER_ID,
];
const INTEGRATION_IDS = [
  SALESFORCE_INTEGRATION_ID,
  HUBSPOT_INTEGRATION_ID,
  PIPEDRIVE_INTEGRATION_ID,
  ZENDESK_SELL_INTEGRATION_ID,
  MS_DYNAMICS_365_SELL_INTEGRATION_ID,
  ZOHO_CRM_INTEGRATION_ID,
  CAPSULE_INTEGRATION_ID,
];

async function seedApplication() {
  // Create application
  await prisma.application.upsert({
    where: {
      id: APPLICATION_ID,
    },
    update: {},
    create: {
      id: APPLICATION_ID,
      name: 'My App',
      config: {
        webhook: {
          url: 'http://localhost:8080/webhook',
          notifyOnSyncSuccess: true,
          notifyOnSyncError: true,
          notifyOnConnectionSuccess: true,
          notifyOnConnectionError: true,
          requestType: 'POST',
        },
      },
    },
  });
}

async function seedCustomers() {
  // Create customers
  await Promise.all(
    CUSTOMER_IDS.map((id) =>
      prisma.customer.upsert({
        where: {
          id,
        },
        update: {},
        create: { id, applicationId: APPLICATION_ID },
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
          applicationId: APPLICATION_ID,
          category: 'crm',
          providerName: SUPPORTED_CRM_CONNECTIONS[idx],
          authType: 'oauth2',
          config: {
            providerAppId: OAUTH_APP_IDS[idx],
            oauth: {
              oauthScopes: OAUTH_SCOPES[idx]?.split(','),
              credentials: {
                oauthClientId: OAUTH_CLIENT_IDS[idx],
                oauthClientSecret: OAUTH_CLIENT_SECRETS[idx],
              },
            },
            sync: {
              periodMs: SUPAGLUE_SYNC_PERIOD_MS,
            },
          },
        },
      })
    )
  );
}

async function main() {
  await seedApplication();
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
