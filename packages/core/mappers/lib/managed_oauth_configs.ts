import { OAuthConfigDecrypted } from '@supaglue/types';

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
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.lists.write',
      'crm.lists.read',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.custom.read',
      'crm.objects.custom.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'crm.objects.feedback_submissions.read',
      'crm.objects.goals.read',
      'crm.objects.line_items.read',
      'crm.objects.line_items.write',
      'crm.objects.marketing_events.read',
      'crm.objects.marketing_events.write',
      'crm.objects.owners.read',
      'crm.objects.quotes.read',
      'crm.objects.quotes.write',
      'crm.schemas.companies.write',
      'crm.schemas.companies.read',
      'crm.schemas.contacts.read',
      'crm.schemas.contacts.write',
      'crm.schemas.custom.write',
      'crm.schemas.custom.read',
      'crm.schemas.deals.read',
      'crm.schemas.deals.write',
      'crm.schemas.line_items.read',
      'crm.schemas.quotes.read',
      'oauth',
      'tickets',
      'timeline',
      'e-commerce',
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
};
