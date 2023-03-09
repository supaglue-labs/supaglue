/* eslint-disable @typescript-eslint/no-floating-promises */
import ActiveCampaignIcon from '@/assets/connector_icons/activecampaign.png';
import CopperIcon from '@/assets/connector_icons/copper.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import MicrosoftDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import ZendeskSellIcon from '@/assets/connector_icons/zendesk_sell.png';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import IntegrationCard from './IntegrationCard';
import IntegrationDetailTabPanel from './IntegrationDetailTabPanel';
import IntegrationTabPanel from './IntegrationTabPanel';

export type Integration = any /* TODO: use type from monorepo */;

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
    icon: <Image alt="salesforce" src={SalesforceIcon} width={25} height={25} />,
    name: 'Salesforce',
    providerName: 'salesforce',
    category: 'crm',
    status: 'available',
    description:
      'CRM software solutions and enterprise cloud computing from Salesforce, the leader in customer relationship management (CRM) and PaaS. Free 30 day trial.',
  },
  {
    icon: <Image alt="hubspot" src={HubspotIcon} width={25} height={25} />,
    name: 'Hubspot',
    providerName: 'hubspot',
    category: 'crm',
    status: 'available',
    description: 'Hubspot is your all-in-one stop for all of your marketing software needs.',
  },
  {
    icon: <Image alt="pipedrive" src={PipedriveIcon} width={25} height={25} />,
    name: 'Pipedrive',
    providerName: 'pipedrive',
    category: 'crm',
    status: 'auth-only',
    description:
      'Pipedrive is the easy-to-use, #1 user-rated CRM tool. Get more qualified leads and grow your business. Sign up for a 14-day free trial.',
  },
  {
    icon: <Image alt="activecampaign" src={ActiveCampaignIcon} width={25} height={25} />,
    name: 'ActiveCampaign',
    providerName: 'activecampaign',
    category: 'crm',
    status: 'auth-only',
    description:
      'Integrated email marketing, marketing automation, and small business CRM. Save time while growing your business with sales automation.',
  },
  {
    icon: <Image alt="copper" src={CopperIcon} width={25} height={25} />,
    name: 'Copper',
    providerName: 'copper',
    category: 'crm',
    status: 'auth-only',
    description:
      'When you need CRM software that works with G Suite, you need Copper. Give us a try and see how we can help your business build stronger customer relationships.',
  },
  {
    icon: <Image alt="ms_dynamics_365_sales" src={MicrosoftDynamics365SalesIcon} width={25} height={25} />,
    name: 'Microsoft Dynamics 365 Sales',
    providerName: 'ms_dynamics_365_sales',
    category: 'crm',
    status: 'auth-only',
    description: 'Dynamics CRM is a leading customer resource management and enterprise resource planning software.',
  },
  {
    icon: <Image alt="zendesk_sell" src={ZendeskSellIcon} width={25} height={25} />,
    name: 'Zendesk Sell',
    providerName: 'zendesk_sell',
    category: 'crm',
    status: 'auth-only',
    description:
      'Zendesk Sell (formerly Base) is a sales automation tool to enhance productivity, processes, and pipeline visibility for sales teams.',
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
type ConfigurationTab = {
  label: string;
  value: string;
};
const configurationTabs: ConfigurationTab[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'CRM API',
    value: 'crm',
  },
  {
    label: 'Auth Only',
    value: 'authonly',
  },
];

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
  const { integrations: activeIntegrations = [] } = useIntegrations();

  React.useEffect(() => {
    const tabIndex = configurationTabs.findIndex((configurationTab) => configurationTab.value === tab[0]);
    setValue(tabIndex);
  }, [tab]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(`/configuration/${configurationTabs[newValue].value}`);
  };

  const targetIntegration = activeIntegrations.find(
    (activeIntegration: Integration) => activeIntegration.providerName === tab[1]
  );

  const targetIntegrationCardInfo = integrationCardsInfo.find(
    (integrationCardInfo) => integrationCardInfo.providerName === tab[1]
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        height: 'full',
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {configurationTabs.map((configurationTab, i) => (
          <Tab key={configurationTab.value} label={configurationTab.label} {...a11yProps(i)} />
        ))}
      </Tabs>
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          {activeIntegrations.map((integration: Integration) => {
            const info = integrationCardsInfo.find((info) => info.providerName === integration.providerName);

            if (!info) {
              return null;
            }

            return (
              <Grid key={info.name} item xs={6}>
                <IntegrationCard enabled={true} integration={integration} integrationInfo={info} />
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1} className="w-full">
        {tab.length === 1 && (
          <IntegrationTabPanel
            status="available"
            integrationCardsInfo={integrationCardsInfo}
            activeIntegrations={activeIntegrations}
          />
        )}
        {tab.length === 2 && targetIntegrationCardInfo && (
          <IntegrationDetailTabPanel
            status="available"
            integration={targetIntegration}
            integrationCardInfo={targetIntegrationCardInfo}
          />
        )}
      </TabPanel>
      <TabPanel value={value} index={2}>
        <IntegrationTabPanel
          status="auth-only"
          integrationCardsInfo={integrationCardsInfo}
          activeIntegrations={activeIntegrations}
        />
      </TabPanel>
    </Box>
  );
}
