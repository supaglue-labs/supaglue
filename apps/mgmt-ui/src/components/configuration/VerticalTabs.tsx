import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import { useIntegrations } from '@/hooks/useIntegrations';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import IntegrationDetailTabPanel from './IntegrationDetailTabPanel';
import IntegrationTabPanel from './IntegrationTabPanel';

const ICON_SIZE = 35;

export type IntegrationCardInfo = {
  icon?: React.ReactNode;
  name: string;
  category: 'crm';
  providerName: string;
  status: 'available' | 'auth-only';
  description: string;
};
const integrationCardsInfo: IntegrationCardInfo[] = [
  {
    icon: <Image alt="salesforce" src={SalesforceIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    status: 'available',
    description: 'Configure your Salesforce integration.',
  },
  {
    icon: <Image alt="hubspot" src={HubspotIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'HubSpot',
    providerName: 'hubspot',
    category: 'crm',
    status: 'available',
    description: 'Configure your HubSpot integration.',
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

export default function VerticalTabs() {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [value, setValue] = React.useState(0);
  const { integrations: existingIntegrations = [] } = useIntegrations();

  const targetIntegration = existingIntegrations.find(
    (existingIntegration) => existingIntegration.providerName === tab[2]
  );

  const targetIntegrationCardInfo = integrationCardsInfo.find(
    (integrationCardInfo) => integrationCardInfo.providerName === tab[2]
  );

  return (
    <TabPanel value={value} index={0} className="w-full">
      {tab.length === 2 && (
        <IntegrationTabPanel
          status="available"
          integrationCardsInfo={integrationCardsInfo}
          existingIntegrations={existingIntegrations}
        />
      )}
      {tab.length === 3 && targetIntegration && targetIntegrationCardInfo && (
        <IntegrationDetailTabPanel
          status="available"
          integration={targetIntegration}
          integrationCardInfo={targetIntegrationCardInfo}
        />
      )}
    </TabPanel>
  );
}
