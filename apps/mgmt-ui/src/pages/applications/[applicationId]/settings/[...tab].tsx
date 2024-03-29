import ApiKeyTabPanel from '@/components/settings/ApiKeyTabPanel';
import WebhookTabPanel from '@/components/settings/WebhookTabPanel';
import { TabContainer } from '@/components/TabContainer';
import { TabPanel } from '@/components/TabPanel';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import Header from '@/layout/Header';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import { Box, Tab, Tabs } from '@mui/material';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';

export { getServerSideProps };

type SettingsHeaderTab = {
  label: string;
  value: string;
};
const settingsHeaderTabs: SettingsHeaderTab[] = [
  {
    label: 'API Keys',
    value: 'api_keys',
  },
  {
    label: 'Webhooks',
    value: 'webhooks',
  },
];

export default function Home(props: SupaglueProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tab = [] } = router.query;
  const [value, setValue] = React.useState(0);
  const activeApplicationId = useActiveApplicationId();
  const enableWebhooksTab = !!props.SVIX_API_TOKEN;

  React.useEffect(() => {
    const tabIndex = settingsHeaderTabs.findIndex((settingsHeaderTab) => settingsHeaderTab.value === tab[0]);
    setValue(tabIndex);
  }, [tab]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header
        {...props}
        tabs={
          <Tabs value={value} textColor="inherit">
            <Tab
              label="API Key"
              onClick={async () => {
                await router.push(`/applications/${activeApplicationId}/settings/api_keys`);
              }}
            />
            {enableWebhooksTab ? (
              <Tab
                label="Webhooks"
                onClick={async () => {
                  await router.push(`/applications/${activeApplicationId}/settings/webhooks`);
                }}
              />
            ) : null}
          </Tabs>
        }
        title="Settings"
        onDrawerToggle={handleDrawerToggle}
      />
      <TabContainer>
        <TabPanel value={value} index={0} className="w-full">
          <ApiKeyTabPanel />
        </TabPanel>
        {enableWebhooksTab ? (
          <TabPanel value={value} index={1} className="w-full">
            <WebhookTabPanel applicationId={activeApplicationId} svixApiToken={props.SVIX_API_TOKEN} />
          </TabPanel>
        ) : null}
      </TabContainer>
    </Box>
  );
}
