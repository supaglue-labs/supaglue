import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import * as React from 'react';
import SyncConfigsListPanel from './SyncConfigListPanel';

export type SyncConfigCardInfo = {
  icon?: React.ReactNode;
  name: string;
  category: 'crm' | 'engagement';
  syncconfigName: string;
  description: string;
};

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

export default function SyncConfigTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;
  // const [_, category, syncconfigName] = Array.isArray(tab) ? tab : [tab];

  const isListPage = tab.length === 1;
  // const isDetailPage = tab.length === 3;

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && <SyncConfigsListPanel />}
      {/* {isDetailPage && (
        <SyncConfigDetailsPanel
          isLoading={isLoading}
          category={category as SyncConfigCategory}
          syncconfigName={syncconfigName as SyncConfigName}
        />
      )} */}
    </TabPanel>
  );
}
