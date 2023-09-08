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
  status: string;
};

export const PROVIDER_CARDS_INFO: ProviderCardInfo[] = [
  {
    name: '6sense',
    providerName: 'six_sense',
    category: 'enrichment',
    description: 'Configure your 6sense provider.',
    status: 'alpha',
  },
  {
    name: 'Amplitude',
    providerName: 'amplitude',
    category: 'analytics',
    description: 'Configure your Amplitude provider.',
    status: 'alpha',
  },
  {
    name: 'Apollo',
    providerName: 'apollo',
    category: 'engagement',
    description: 'Configure your Apollo provider.',
    status: 'beta',
  },
  {
    name: 'Asana',
    providerName: 'asana',
    category: 'ticketing',
    description: 'Configure your Asana provider.',
    status: 'alpha',
  },
  {
    name: 'Box',
    providerName: 'box',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your Box provider.',
    status: 'alpha',
  },
  {
    name: 'Chargebee',
    providerName: 'chargebee',
    category: 'billing',
    description: 'Configure your Chargebee provider.',
    status: 'alpha',
  },
  {
    name: 'Clearbit',
    providerName: 'clearbit',
    category: 'enrichment',
    description: 'Configure your Clearbit provider.',
    status: 'alpha',
  },
  {
    name: 'Dropbox',
    providerName: 'dropbox',
    category: 'file_storage',
    description: 'Configure your Dropbox provider.',
    status: 'alpha',
  },
  {
    name: 'Gmail',
    providerName: 'gmail',
    category: 'email',
    description: 'Configure your Gmail provider.',
    status: 'alpha',
  },
  {
    name: 'Gong',
    providerName: 'gong',
    displayCategory: 'engagement',
    category: 'no_category',
    description: 'Configure your Gong provider.',
    status: 'beta',
  },
  {
    name: 'Google Analytics',
    providerName: 'google_analytics',
    category: 'analytics',
    description: 'Configure your Google Analytics provider.',
    status: 'alpha',
  },
  {
    name: 'Google Calendar',
    providerName: 'google_calendar',
    category: 'calendar',
    description: 'Configure your Google Calendar provider.',
    status: 'alpha',
  },
  {
    name: 'Google Drive',
    providerName: 'google_drive',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your Google Drive provider.',
    status: 'alpha',
  },
  {
    name: 'HubSpot',
    providerName: 'hubspot',
    category: 'crm',
    description: 'Configure your HubSpot provider.',
    status: 'beta',
  },
  {
    name: 'Intercom',
    providerName: 'intercom',
    displayCategory: 'ticketing',
    category: 'no_category',
    description: 'Configure your Intercom provider.',
    status: 'beta',
  },
  {
    name: 'Linear',
    providerName: 'linear',
    displayCategory: 'ticketing',
    category: 'no_category',
    description: 'Configure your Linear provider.',
    status: 'beta',
  },
  {
    name: 'LinkedIn',
    providerName: 'linkedin',
    category: 'messaging',
    description: 'Configure your LinkedIn provider.',
    status: 'alpha',
  },
  {
    name: 'Marketo',
    providerName: 'marketo',
    category: 'marketing_automation',
    displayCategory: 'marketing automation',
    description: 'Configure your Marketo provider.',
    status: 'beta',
  },
  {
    name: 'Messenger',
    providerName: 'messenger',
    category: 'messaging',
    description: 'Configure your Messenger provider.',
    status: 'alpha',
  },
  {
    name: 'Mixpanel',
    providerName: 'mixpanel',
    category: 'analytics',
    description: 'Configure your Mixpanel provider.',
    status: 'alpha',
  },
  {
    name: 'Microsoft Dynamics 365 Sales',
    providerName: 'ms_dynamics_365_sales',
    category: 'crm',
    description: 'Configure your MS Dynamics 365 Sales provider.',
    status: 'beta',
  },
  {
    name: 'Microsoft Teams',
    providerName: 'ms_teams',
    category: 'communications',
    description: 'Configure your Microsoft Teams provider.',
    status: 'alpha',
  },
  {
    name: 'OneDrive',
    providerName: 'onedrive',
    category: 'file_storage',
    displayCategory: 'file storage',
    description: 'Configure your OneDrive provider.',
    status: 'alpha',
  },
  {
    name: 'Outlook',
    providerName: 'outlook',
    category: 'email',
    description: 'Configure your Outlook provider.',
    status: 'alpha',
  },
  {
    name: 'Outreach',
    providerName: 'outreach',
    category: 'engagement',
    description: 'Configure your Outreach provider.',
    status: 'beta',
  },
  {
    name: 'Salesforce Marketing Cloud Account Engagement (Pardot)',
    providerName: 'salesforce_marketing_cloud_account_engagement',
    category: 'marketing_automation',
    displayCategory: 'marketing automation',
    description: 'Configure your Salesforce Marketing Cloud Account Engagement provider.',
    status: 'beta',
  },
  {
    name: 'Pipedrive',
    providerName: 'pipedrive',
    category: 'crm',
    description: 'Configure your Pipedrive provider.',
    status: 'beta',
  },
  {
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    description: 'Configure your Salesforce provider.',
    status: 'beta',
  },
  {
    name: 'Salesloft',
    providerName: 'salesloft',
    category: 'engagement',
    description: 'Configure your Salesloft provider.',
    status: 'beta',
  },
  {
    name: 'Segment',
    providerName: 'segment',
    category: 'analytics',
    description: 'Configure your Segment provider.',
    status: 'alpha',
  },
  {
    name: 'Slack',
    providerName: 'slack',
    category: 'communications',
    description: 'Configure your Slack provider.',
    status: 'alpha',
  },
  {
    name: 'Stripe',
    providerName: 'stripe',
    category: 'billing',
    description: 'Configure your Stripe provider.',
    status: 'alpha',
  },
  {
    name: 'Whatsapp',
    providerName: 'whatsapp',
    category: 'communications',
    description: 'Configure your Whatsapp provider.',
    status: 'alpha',
  },
  {
    name: 'Zendesk',
    providerName: 'zendesk',
    category: 'ticketing',
    description: 'Configure your Zendesk provider.',
    status: 'alpha',
  },
  {
    name: 'Zoho',
    providerName: 'zoho',
    category: 'crm',
    description: 'Configure your Zoho provider.',
    status: 'alpha',
  },
  {
    name: 'Zoom',
    providerName: 'zoom',
    category: 'communications',
    description: 'Configure your Zoom provider.',
    status: 'alpha',
  },
  {
    name: 'Zoominfo',
    providerName: 'zoominfo',
    category: 'enrichment',
    description: 'Configure your Zoominfo provider.',
    status: 'alpha',
  },
  {
    name: 'Zuora',
    providerName: 'zuora',
    category: 'billing',
    description: 'Configure your Zuora provider.',
    status: 'alpha',
  },
];

export const getDisplayName = (providerName: string): string => {
  const providerCardInfo = PROVIDER_CARDS_INFO.find(
    (providerCardInfo) => providerCardInfo.providerName === providerName
  );
  return providerCardInfo ? providerCardInfo.name : capitalizeString(providerName);
};
