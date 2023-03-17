/* eslint-disable @typescript-eslint/no-floating-promises */
// import ActiveCampaignIcon from '@/assets/connector_icons/activecampaign.png';
// import CopperIcon from '@/assets/connector_icons/copper.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
// import MicrosoftDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.png';
// import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
// import ZendeskSellIcon from '@/assets/connector_icons/zendesk_sell.png';
import { useIntegrations } from '@/hooks/useIntegrations';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import IntegrationDetailTabPanel from './IntegrationDetailTabPanel';
import IntegrationTabPanel from './IntegrationTabPanel';

export type Integration = any /* TODO: use type from monorepo */;

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
  // {
  //   icon: <Image alt="pipedrive" src={PipedriveIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  //   name: 'Pipedrive',
  //   providerName: 'pipedrive',
  //   category: 'crm',
  //   status: 'auth-only',
  //   description:
  //     'Pipedrive is the easy-to-use, #1 user-rated CRM tool. Get more qualified leads and grow your business. Sign up for a 14-day free trial.',
  // },
  // {
  //   icon: <Image alt="activecampaign" src={ActiveCampaignIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  //   name: 'ActiveCampaign',
  //   providerName: 'activecampaign',
  //   category: 'crm',
  //   status: 'auth-only',
  //   description:
  //     'Integrated email marketing, marketing automation, and small business CRM. Save time while growing your business with sales automation.',
  // },
  // {
  //   icon: <Image alt="copper" src={CopperIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  //   name: 'Copper',
  //   providerName: 'copper',
  //   category: 'crm',
  //   status: 'auth-only',
  //   description:
  //     'When you need CRM software that works with G Suite, you need Copper. Give us a try and see how we can help your business build stronger customer relationships.',
  // },
  // {
  //   icon: (
  //     <Image alt="ms_dynamics_365_sales" src={MicrosoftDynamics365SalesIcon} width={ICON_SIZE} height={ICON_SIZE} />
  //   ),
  //   name: 'Microsoft Dynamics 365 Sales',
  //   providerName: 'ms_dynamics_365_sales',
  //   category: 'crm',
  //   status: 'auth-only',
  //   description: 'Dynamics CRM is a leading customer resource management and enterprise resource planning software.',
  // },
  // {
  //   icon: <Image alt="zendesk_sell" src={ZendeskSellIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  //   name: 'Zendesk Sell',
  //   providerName: 'zendesk_sell',
  //   category: 'crm',
  //   status: 'auth-only',
  //   description:
  //     'Zendesk Sell (formerly Base) is a sales automation tool to enhance productivity, processes, and pipeline visibility for sales teams.',
  // },
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

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [value, setValue] = React.useState(0);
  const { integrations: existingIntegrations = [] } = useIntegrations();

  const targetIntegration = existingIntegrations.find(
    (existingIntegration: Integration) => existingIntegration.providerName === tab[2]
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
      {tab.length === 3 && targetIntegrationCardInfo && (
        <IntegrationDetailTabPanel
          status="available"
          integration={targetIntegration}
          integrationCardInfo={targetIntegrationCardInfo}
        />
      )}
    </TabPanel>
  );
}
