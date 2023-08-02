import ApolloIcon from '@/assets/connector_icons/apollo.webp';
import AsanaIcon from '@/assets/connector_icons/asana.png';
import BoxIcon from '@/assets/connector_icons/box.png';
import DropboxIcon from '@/assets/connector_icons/dropbox.png';
import GCalIcon from '@/assets/connector_icons/gcal.png';
import GmailIcon from '@/assets/connector_icons/gmail.png';
import GongIcon from '@/assets/connector_icons/gong.webp';
import GDriveIcon from '@/assets/connector_icons/google_drive.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import IntercomIcon from '@/assets/connector_icons/intercom.png';
import LinearIcon from '@/assets/connector_icons/linear.svg';
import LinkedInIcon from '@/assets/connector_icons/linkedin.png';
import MarketoIcon from '@/assets/connector_icons/marketo.png';
import MessengerIcon from '@/assets/connector_icons/messenger.png';
import MsDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.svg';
import TeamsIcon from '@/assets/connector_icons/ms_teams.png';
import OneDriveIcon from '@/assets/connector_icons/onedrive.png';
import OutlookIcon from '@/assets/connector_icons/outlook.png';
import OutreachIcon from '@/assets/connector_icons/outreach.png';
import PardotIcon from '@/assets/connector_icons/pardot.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import SalesloftIcon from '@/assets/connector_icons/salesloft.webp';
import SlackIcon from '@/assets/connector_icons/slack.png';
import WhatsappIcon from '@/assets/connector_icons/whatsapp.png';
import ZendeskIcon from '@/assets/connector_icons/zendesk.png';
import ZohoIcon from '@/assets/connector_icons/zoho_crm.png';
import { TabPanel } from '@/components/TabPanel';
import { useProviders } from '@/hooks/useProviders';
import type { ProviderCategory, ProviderName } from '@supaglue/types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import ProviderDetailsPanel from './ProviderDetailsPanel';
import ProvidersListPanel from './ProvidersListPanel';

const ICON_SIZE = 35;

export type ProviderCardInfo = {
  icon?: React.ReactNode;
  name: string;
  displayCategory?: string;
  category: string;
  providerName: string;
  description: string;
};

export const providerCardsInfo: ProviderCardInfo[] = [
  {
    icon: <Image alt="salesforce" src={SalesforceIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    description: 'Configure your Salesforce provider.',
  },
  {
    icon: <Image alt="hubspot" src={HubspotIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'HubSpot',
    providerName: 'hubspot',
    category: 'crm',
    description: 'Configure your HubSpot provider.',
  },
  {
    icon: <Image alt="pipedrive" src={PipedriveIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Pipedrive',
    providerName: 'pipedrive',
    category: 'crm',
    description: 'Configure your Pipedrive provider.',
  },
  {
    icon: <Image alt="ms_dynamics_365_sales" src={MsDynamics365SalesIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Microsoft Dynamics 365 Sales',
    providerName: 'ms_dynamics_365_sales',
    category: 'crm',
    description: 'Configure your MS Dynamics 365 Sales provider.',
  },
  {
    icon: <Image alt="outreach" src={OutreachIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Outreach',
    providerName: 'outreach',
    category: 'engagement',
    description: 'Configure your Outreach provider.',
  },
  {
    icon: <Image alt="gong" src={GongIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Gong',
    providerName: 'gong',
    displayCategory: 'engagement',
    category: 'no_category',
    description: 'Configure your Gong provider.',
  },
  {
    icon: <Image alt="apollo" src={ApolloIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Apollo',
    providerName: 'apollo',
    category: 'engagement',
    description: 'Configure your Apollo provider.',
  },
  {
    icon: <Image alt="salesloft" src={SalesloftIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Salesloft',
    providerName: 'salesloft',
    category: 'engagement',
    description: 'Configure your Salesloft provider.',
  },
  {
    icon: <Image alt="intercom" src={IntercomIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Intercom',
    providerName: 'intercom',
    displayCategory: 'ticketing',
    category: 'no_category',
    description: 'Configure your Intercom provider.',
  },
  {
    icon: <Image alt="asana" src={AsanaIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Asana',
    providerName: 'asana',
    category: 'ticketing',
    description: 'Configure your Asana provider.',
  },
  {
    icon: <Image alt="box" src={BoxIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Box',
    providerName: 'box',
    category: 'file storage',
    description: 'Configure your Box provider.',
  },
  {
    icon: <Image alt="dropbox" src={DropboxIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Dropbox',
    providerName: 'dropbox',
    category: 'file storage',
    description: 'Configure your Dropbox provider.',
  },
  {
    icon: <Image alt="gmail" src={GmailIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Gmail',
    providerName: 'gmail',
    category: 'email',
    description: 'Configure your Gmail provider.',
  },

  {
    icon: <Image alt="google_calendar" src={GCalIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Google Calendar',
    providerName: 'google_calendar',
    category: 'calendar',
    description: 'Configure your Google Calendar provider.',
  },
  {
    icon: <Image alt="google_drive" src={GDriveIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Google Drive',
    providerName: 'google_drive',
    category: 'file storage',
    description: 'Configure your Google Drive provider.',
  },

  {
    icon: <Image alt="linkedin" src={LinkedInIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'LinkedIn',
    providerName: 'linkedin',
    category: 'messaging',
    description: 'Configure your LinkedIn provider.',
  },
  {
    icon: <Image alt="marketo" src={MarketoIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Marketo',
    providerName: 'marketo',
    category: 'marketing automation',
    description: 'Configure your Marketo provider.',
  },
  {
    icon: <Image alt="messenger" src={MessengerIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Messenger',
    providerName: 'messenger',
    category: 'messaging',
    description: 'Configure your Messenger provider.',
  },
  {
    icon: <Image alt="onedrive" src={OneDriveIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'OneDrive',
    providerName: 'onedrive',
    category: 'file storage',
    description: 'Configure your OneDrive provider.',
  },
  {
    icon: <Image alt="outlook" src={OutlookIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Outlook',
    providerName: 'outlook',
    category: 'email',
    description: 'Configure your Outlook provider.',
  },
  {
    icon: <Image alt="pardot" src={PardotIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Pardot',
    providerName: 'pardot',
    category: 'marketing automation',
    description: 'Configure your Pardot provider.',
  },
  {
    icon: <Image alt="slack" src={SlackIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Slack',
    providerName: 'slack',
    category: 'communications',
    description: 'Configure your Slack provider.',
  },
  {
    icon: <Image alt="ms_teams" src={TeamsIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Microsoft Teams',
    providerName: 'ms_teams',
    category: 'communications',
    description: 'Configure your Microsoft Teams provider.',
  },
  {
    icon: <Image alt="whatsapp" src={WhatsappIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Whatsapp',
    providerName: 'whatsapp',
    category: 'communications',
    description: 'Configure your Whatsapp provider.',
  },
  {
    icon: <Image alt="zendesk" src={ZendeskIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Zendesk',
    providerName: 'zendesk',
    category: 'ticketing',
    description: 'Configure your Zendesk provider.',
  },
  {
    icon: <Image alt="zoho" src={ZohoIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Zoho',
    providerName: 'zoho',
    category: 'crm',
    description: 'Configure your Zoho provider.',
  },
  {
    icon: <Image alt="linear" src={LinearIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Linear',
    providerName: 'linear',
    category: 'no_category',
    description: 'Configure your Linear provider.',
  },
];

export default function ProviderTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [_, category, providerName] = Array.isArray(tab) ? tab : [tab];
  const { providers: existingProviders = [], isLoading } = useProviders();

  const isListPage = tab.length === 1;
  const isDetailPage = tab.length === 3;

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && (
        <ProvidersListPanel
          isLoading={isLoading}
          providerCardsInfo={providerCardsInfo}
          existingProviders={existingProviders}
        />
      )}
      {isDetailPage && (
        <ProviderDetailsPanel
          isLoading={isLoading}
          category={category as ProviderCategory}
          providerName={providerName as ProviderName}
        />
      )}
    </TabPanel>
  );
}
