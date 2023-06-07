import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import OutreachIcon from '@/assets/connector_icons/outreach.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import { useIntegrations } from '@/hooks/useIntegrations';
import Box from '@mui/material/Box';
import { ProviderCategory, ProviderName } from '@supaglue/types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import IntegrationDetailsPanel from './IntegrationDetailsPanel';
import IntegrationsListPanel from './IntegrationsTabPanel';

const ICON_SIZE = 35;

export type IntegrationCardInfo = {
  icon?: React.ReactNode;
  name: string;
  category: 'crm' | 'engagement';
  providerName: string;
  description: string;
};

export const integrationCardsInfo: IntegrationCardInfo[] = [
  {
    icon: <Image alt="salesforce" src={SalesforceIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    description: 'Configure your Salesforce integration.',
  },
  {
    icon: <Image alt="hubspot" src={HubspotIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'HubSpot',
    providerName: 'hubspot',
    category: 'crm',
    description: 'Configure your HubSpot integration.',
  },
  {
    icon: <Image alt="pipedrive" src={PipedriveIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Pipedrive (BETA)',
    providerName: 'pipedrive',
    category: 'crm',
    description: 'Configure your Pipedrive integration.',
  },
  {
    icon: <Image alt="outreach" src={OutreachIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Outreach (BETA)',
    providerName: 'outreach',
    category: 'engagement',
    description: 'Configure your Outreach integration.',
  },
];

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IntegrationTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [_, category, providerName] = Array.isArray(tab) ? tab : [tab];
  const { integrations: existingIntegrations = [], isLoading } = useIntegrations();

  const isListPage = tab.length === 1;
  const isDetailPage = tab.length === 3;

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && (
        <IntegrationsListPanel
          isLoading={isLoading}
          integrationCardsInfo={integrationCardsInfo}
          existingIntegrations={existingIntegrations}
        />
      )}
      {isDetailPage && (
        <IntegrationDetailsPanel
          isLoading={isLoading}
          category={category as ProviderCategory}
          providerName={providerName as ProviderName}
        />
      )}
    </TabPanel>
  );
}
