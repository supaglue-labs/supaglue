import { HUBSPOT_STANDARD_OBJECT_TYPES, SALESFORCE_OBJECTS } from '@supaglue/utils';
import { GONG_STANDARD_OBJECTS, INTERCOM_STANDARD_OBJECTS, LINEAR_STANDARD_OBJECTS } from '@supaglue/utils/constants';
import { capitalizeString } from './capitalizeString';

export const getStandardObjectOptions = (providerName?: string): string[] => {
  switch (providerName) {
    case 'hubspot': {
      return HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[];
    }
    case 'salesforce': {
      return SALESFORCE_OBJECTS as unknown as string[];
    }
    case 'gong': {
      return GONG_STANDARD_OBJECTS as unknown as string[];
    }
    case 'intercom': {
      return INTERCOM_STANDARD_OBJECTS as unknown as string[];
    }
    case 'linear': {
      return LINEAR_STANDARD_OBJECTS as unknown as string[];
    }
    default:
      return [];
  }
};

export type ProviderCardInfo = {
  name: string;
  displayCategory?: string;
  category: string;
  providerName: string;
  description: string;
};

export const PROVIDER_CARDS_INFO: ProviderCardInfo[] = [
  {
    name: '6sense',
    providerName: 'six_sense',
    category: 'enrichment',
    description: 'Configure your 6sense provider.',
  },
  {
    name: 'Amplitude',
    providerName: 'amplitude',
    category: 'analytics',
    description: 'Configure your Amplitude provider.',
  },
  {
    name: 'Apollo',
    providerName: 'apollo',
    category: 'engagement',
    description: 'Configure your Apollo provider.',
  },
  {
    name: 'Asana',
    providerName: 'asana',
    category: 'ticketing',
    description: 'Configure your Asana provider.',
  },
  {
    name: 'Box',
    providerName: 'box',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your Box provider.',
  },
  {
    name: 'Chargebee',
    providerName: 'chargebee',
    category: 'billing',
    description: 'Configure your Chargebee provider.',
  },
  {
    name: 'Clearbit',
    providerName: 'clearbit',
    category: 'enrichment',
    description: 'Configure your Clearbit provider.',
  },
  {
    name: 'Dropbox',
    providerName: 'dropbox',
    category: 'file_storage',
    description: 'Configure your Dropbox provider.',
  },
  {
    name: 'Gmail',
    providerName: 'gmail',
    category: 'email',
    description: 'Configure your Gmail provider.',
  },
  {
    name: 'Gong',
    providerName: 'gong',
    displayCategory: 'engagement',
    category: 'no_category',
    description: 'Configure your Gong provider.',
  },
  {
    name: 'Google Analytics',
    providerName: 'google_analytics',
    category: 'analytics',
    description: 'Configure your Google Analytics provider.',
  },
  {
    name: 'Google Calendar',
    providerName: 'google_calendar',
    category: 'calendar',
    description: 'Configure your Google Calendar provider.',
  },
  {
    name: 'Google Drive',
    providerName: 'google_drive',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your Google Drive provider.',
  },
  {
    name: 'HubSpot',
    providerName: 'hubspot',
    category: 'crm',
    description: 'Configure your HubSpot provider.',
  },
  {
    name: 'Intercom',
    providerName: 'intercom',
    displayCategory: 'ticketing',
    category: 'no_category',
    description: 'Configure your Intercom provider.',
  },
  {
    name: 'Linear',
    providerName: 'linear',
    displayCategory: 'ticketing',
    category: 'no_category',
    description: 'Configure your Linear provider.',
  },
  {
    name: 'LinkedIn',
    providerName: 'linkedin',
    category: 'messaging',
    description: 'Configure your LinkedIn provider.',
  },
  {
    name: 'Marketo',
    providerName: 'marketo',
    category: 'marketing_automation',
    displayCategory: 'marketing automation',
    description: 'Configure your Marketo provider.',
  },
  {
    name: 'Messenger',
    providerName: 'messenger',
    category: 'messaging',
    description: 'Configure your Messenger provider.',
  },
  {
    name: 'Mixpanel',
    providerName: 'mixpanel',
    category: 'analytics',
    description: 'Configure your Mixpanel provider.',
  },
  {
    name: 'Microsoft Dynamics 365 Sales',
    providerName: 'ms_dynamics_365_sales',
    category: 'crm',
    description: 'Configure your MS Dynamics 365 Sales provider.',
  },
  {
    name: 'Microsoft Teams',
    providerName: 'ms_teams',
    category: 'communications',
    description: 'Configure your Microsoft Teams provider.',
  },
  {
    name: 'OneDrive',
    providerName: 'onedrive',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your OneDrive provider.',
  },
  {
    name: 'Outlook',
    providerName: 'outlook',
    category: 'email',
    description: 'Configure your Outlook provider.',
  },
  {
    name: 'Outreach',
    providerName: 'outreach',
    category: 'engagement',
    description: 'Configure your Outreach provider.',
  },
  {
    name: 'Salesforce Marketing Cloud Account Engagement (Pardot)',
    providerName: 'salesforce_marketing_cloud_account_engagement',
    category: 'marketing_automation',
    displayCategory: 'marketing automation',
    description: 'Configure your Salesforce Marketing Cloud Account Engagement provider.',
  },
  {
    name: 'Pipedrive',
    providerName: 'pipedrive',
    category: 'crm',
    description: 'Configure your Pipedrive provider.',
  },
  {
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    description: 'Configure your Salesforce provider.',
  },
  {
    name: 'Salesloft',
    providerName: 'salesloft',
    category: 'engagement',
    description: 'Configure your Salesloft provider.',
  },
  {
    name: 'Segment',
    providerName: 'segment',
    category: 'analytics',
    description: 'Configure your Segment provider.',
  },
  {
    name: 'Slack',
    providerName: 'slack',
    category: 'communications',
    description: 'Configure your Slack provider.',
  },
  {
    name: 'Stripe',
    providerName: 'stripe',
    category: 'billing',
    description: 'Configure your Stripe provider.',
  },
  {
    name: 'Whatsapp',
    providerName: 'whatsapp',
    category: 'communications',
    description: 'Configure your Whatsapp provider.',
  },
  {
    name: 'Zendesk',
    providerName: 'zendesk',
    category: 'ticketing',
    description: 'Configure your Zendesk provider.',
  },
  {
    name: 'Zoho',
    providerName: 'zoho',
    category: 'crm',
    description: 'Configure your Zoho provider.',
  },
  {
    name: 'Zoom',
    providerName: 'zoom',
    category: 'communications',
    description: 'Configure your Zoom provider.',
  },
  {
    name: 'Zoominfo',
    providerName: 'zoominfo',
    category: 'enrichment',
    description: 'Configure your Zoominfo provider.',
  },
  {
    name: 'Zuora',
    providerName: 'zuora',
    category: 'billing',
    description: 'Configure your Zuora provider.',
  },
];

export const getDisplayName = (providerName: string): string => {
  const providerCardInfo = PROVIDER_CARDS_INFO.find(
    (providerCardInfo) => providerCardInfo.providerName === providerName
  );
  return providerCardInfo ? providerCardInfo.name : capitalizeString(providerName);
};
