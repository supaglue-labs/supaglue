import type { PublicEnvProps } from '@/components/AccountMenu';
import EntityTabPanelContainer from '@/components/dataModel/entity/EntityTabPanelContainer';
import SchemaTabPanelContainer from '@/components/dataModel/schema/SchemaTabPanelContainer';
import { TabContainer } from '@/components/TabContainer';
import { TabPanel } from '@/components/TabPanel';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import { Box, Tab, Tabs } from '@mui/material';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';

export { getServerSideProps };

type DataModelHeaderTab = {
  label: string;
  value: string;
};
const dataModelHeaderTabs: DataModelHeaderTab[] = [
  {
    label: 'Entities',
    value: 'entities',
  },
  {
    label: 'Schemas',
    value: 'schemas',
  },
];

export default function Home({ accountMenuProps }: { accountMenuProps: PublicEnvProps }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tab = [] } = router.query;
  const [value, setValue] = React.useState(0);

  const activeApplicationId = useActiveApplicationId();

  React.useEffect(() => {
    const tabIndex = dataModelHeaderTabs.findIndex((dataModelHeaderTab) => dataModelHeaderTab.value === tab[0]);
    setValue(tabIndex);
  }, [tab]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header
        accountMenuProps={accountMenuProps}
        tabs={
          <Tabs value={value} textColor="inherit">
            <Tab
              label="Entities"
              onClick={async () => {
                await router.push(`/applications/${activeApplicationId}/data_model/entities`);
              }}
            />
            <Tab
              label="Schemas"
              onClick={async () => {
                await router.push(`/applications/${activeApplicationId}/data_model/schemas`);
              }}
            />
          </Tabs>
        }
        title="Data Model"
        onDrawerToggle={handleDrawerToggle}
      />
      <TabContainer>
        <TabPanel value={value} index={0} className="w-full">
          <EntityTabPanelContainer />
        </TabPanel>
        <TabPanel value={value} index={1} className="w-full">
          <SchemaTabPanelContainer />
        </TabPanel>
      </TabContainer>
    </Box>
  );
}
