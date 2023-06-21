import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

const algorithm = 'aes-256-cbc';
const saltLength = 16;
const ivLength = 16;

dotenv.config({
  path: '/app/.env',
});
const prisma = new PrismaClient();

const DO_SEED = process.env.DO_SEED === '1';

const { SUPAGLUE_API_ENCRYPTION_SECRET, SUPAGLUE_QUICKSTART_API_KEY } = process.env;

const ORGANIZATION_ID = 'e7070cc8-36e7-43e2-81fc-ad57713cf2d3';

const APPLICATION_ID = 'a4398523-03a2-42dd-9681-c91e3e2efaf4';

const SALESFORCE_CUSTOMER_ID = 'external-customer-salesforce';
const HUBSPOT_CUSTOMER_ID = 'external-customer-hubspot';
const PIPEDRIVE_CUSTOMER_ID = 'external-customer-pipedrive';
const ZENDESK_SELL_CUSTOMER_ID = 'external-customer-zendesk';
const MS_DYNAMICS_365_SELL_CUSTOMER_ID = 'external-customer-ms-dynamics-365';
const ZOHO_CRM_CUSTOMER_ID = 'external-customer-zoho';
const CAPSULE_CUSTOMER_ID = 'external-customer-capsule';

const EXTERNAL_CUSTOMER_IDS = [
  SALESFORCE_CUSTOMER_ID,
  HUBSPOT_CUSTOMER_ID,
  PIPEDRIVE_CUSTOMER_ID,
  ZENDESK_SELL_CUSTOMER_ID,
  MS_DYNAMICS_365_SELL_CUSTOMER_ID,
  ZOHO_CRM_CUSTOMER_ID,
  CAPSULE_CUSTOMER_ID,
];

// Remove once we can stop seeding integrations
function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha512');
}

// NOTE: copied from crypt.ts (can be de-duplicated after seed becomes a script)
export async function cryptoHash(text: string): Promise<{ original: string; hashed: string }> {
  const hashedText = crypto.scryptSync(text, SUPAGLUE_API_ENCRYPTION_SECRET!, 64).toString('hex');
  return {
    original: text,
    hashed: hashedText,
  };
}

async function seedApplication() {
  let hashedApiKey = '';
  if (SUPAGLUE_QUICKSTART_API_KEY) {
    ({ hashed: hashedApiKey } = await cryptoHash(SUPAGLUE_QUICKSTART_API_KEY));
  }

  // Create application
  await prisma.application.upsert({
    where: {
      id: APPLICATION_ID,
    },
    update: {
      name: 'My App',
      config: {
        apiKey: hashedApiKey,
        webhook: null,
      },
      orgId: ORGANIZATION_ID,
    },
    create: {
      id: APPLICATION_ID,
      name: 'My App',
      config: {
        apiKey: hashedApiKey,
        webhook: null,
      },
      orgId: ORGANIZATION_ID,
    },
  });
}

async function seedCustomers() {
  // Create customers
  await Promise.all(
    EXTERNAL_CUSTOMER_IDS.map((externalCustomerId, idx) =>
      prisma.customer.upsert({
        where: {
          id: `${APPLICATION_ID}:${externalCustomerId}`,
        },
        update: {
          applicationId: APPLICATION_ID,
          name: `customer-${idx}`,
          email: `customer-${idx}@email.com`,
          externalIdentifier: externalCustomerId,
        },
        create: {
          id: `${APPLICATION_ID}:${externalCustomerId}`,
          applicationId: APPLICATION_ID,
          name: `customer-${idx}`,
          email: `customer-${idx}@email.com`,
          externalIdentifier: externalCustomerId,
        },
      })
    )
  );
}

async function main() {
  if (!DO_SEED) {
    return;
  }
  await seedApplication();
  await seedCustomers();
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
