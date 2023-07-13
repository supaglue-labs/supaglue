import GongIcon from '@/assets/connector_icons/gong.webp';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import MsDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.png';
import OutreachIcon from '@/assets/connector_icons/outreach.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
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
  category: 'crm' | 'engagement';
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
    category: 'engagement',
    description: 'Configure your Gong provider.',
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
