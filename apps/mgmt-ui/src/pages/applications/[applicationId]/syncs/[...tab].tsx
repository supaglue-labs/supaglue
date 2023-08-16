import SyncConfigTabPanelContainer from '@/components/syncs/syncConfig/SyncConfigTabPanelContainer';
import SyncsListPanel from '@/components/syncs/SyncsListPanel';
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
    label: 'Syncs',
    value: 'syncs',
  },
  {
    label: 'Sync Configs',
    value: 'sync_configs',
  },
];

export default function Home(props: SupaglueProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tab = [] } = router.query;
  const [value, setValue] = React.useState(0);

  const activeApplicationId = useActiveApplicationId();

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
              label="Syncs"
              onClick={async () => {
                await router.push(`/applications/${activeApplicationId}/syncs/syncs`);
              }}
            />
            <Tab
              label="Sync Configs"
              onClick={async () => {
                await router.push(`/applications/${activeApplicationId}/syncs/sync_configs`);
              }}
            />
          </Tabs>
        }
        title="Syncs"
        onDrawerToggle={handleDrawerToggle}
      />
      <TabContainer>
        <TabPanel value={value} index={0} className="w-full">
          <SyncsListPanel />
        </TabPanel>
        <TabPanel value={value} index={1} className="w-full">
          <SyncConfigTabPanelContainer />
        </TabPanel>
      </TabContainer>
    </Box>
  );
}
