import type { OAuthConfigDecrypted } from '@supaglue/types';

// TODO: namespace the map by vertical
export const managedOAuthConfigs: Record<string, OAuthConfigDecrypted> = {
  salesforce: {
    oauthScopes: ['id', 'api', 'refresh_token'],
    credentials: {
      oauthClientId: process.env.SALESFORCE_CLIENT_ID || '',
      oauthClientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
    },
  },
  hubspot: {
    oauthScopes: [
      'business-intelligence',
      'crm.lists.read',
      'crm.lists.write',
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'crm.objects.owners.read',
      'crm.schemas.companies.read',
      'crm.schemas.companies.write',
      'crm.schemas.contacts.read',
      'crm.schemas.contacts.write',
      'crm.schemas.deals.read',
      'crm.schemas.deals.write',
      'conversations.read',
      'crm.import',
      'files',
      'forms',
      'forms-uploaded-files',
      'integration-sync',
      'oauth',
      'sales-email-read',
      'tickets',
      'timeline',
    ],
    credentials: {
      oauthClientId: process.env.HUBSPOT_CLIENT_ID || '',
      oauthClientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
    },
  },
  capsule: {
    oauthScopes: [],
    credentials: {
      oauthClientId: process.env.CAPSULE_CLIENT_ID || '',
      oauthClientSecret: process.env.CAPSULE_CLIENT_SECRET || '',
    },
  },
  ms_dynamics_365_sales: {
    oauthScopes: [],
    credentials: {
      oauthClientId: process.env.MS_DYNAMICS_365_SALES_CLIENT_ID || '',
      oauthClientSecret: process.env.MS_DYNAMICS_365_SALES_CLIENT_SECRET || '',
    },
  },
  pipedrive: {
    oauthScopes: ['deals:full', 'contacts:full', 'leads:full', 'users:read', 'organizations:full'],
    credentials: {
      oauthClientId: process.env.PIPEDRIVE_CLIENT_ID || '',
      oauthClientSecret: process.env.PIPEDRIVE_CLIENT_SECRET || '',
    },
  },
  zendesk: {
    oauthScopes: [],
    credentials: {
      oauthClientId: process.env.ZENDESK_CLIENT_ID || '',
      oauthClientSecret: process.env.ZENDESK_CLIENT_SECRET || '',
    },
  },
  zoho_crm: {
    oauthScopes: [],
    credentials: {
      oauthClientId: process.env.ZOHO_CLIENT_ID || '',
      oauthClientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    },
  },
  outreach: {
    oauthScopes: [
      'accounts.all',
      'prospects.all',
      'calls.all',
      'emailAddresses.all',
      'phoneNumbers.all',
      'users.all',
      'sequences.all',
      'sequenceStates.all',
      'mailboxes.all',
    ],
    credentials: {
      oauthClientId: process.env.OUTREACH_CLIENT_ID || '',
      oauthClientSecret: process.env.OUTREACH_CLIENT_SECRET || '',
    },
  },
  salesloft: {
    oauthScopes: [],
    credentials: {
      oauthClientId: process.env.SALESLOFT_CLIENT_ID || '',
      oauthClientSecret: process.env.SALESLOFT_CLIENT_SECRET || '',
    },
  },
  gong: {
    oauthScopes: ['api:calls:read:basic', 'api:calls:read:extensive', 'api:calls:read:transcript'],
    credentials: {
      oauthClientId: process.env.GONG_CLIENT_ID || '',
      oauthClientSecret: process.env.GONG_CLIENT_SECRET || '',
    },
  },
  linear: {
    oauthScopes: ['read', 'write', 'issues:create', 'comments:create'],
    credentials: {
      oauthClientId: process.env.LINEAR_CLIENT_ID || '',
      oauthClientSecret: process.env.LINEAR_CLIENT_SECRET || '',
    },
  },
};
