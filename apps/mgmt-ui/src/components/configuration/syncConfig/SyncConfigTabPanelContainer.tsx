import { TabPanel } from '@/components/TabPanel';
import { useRouter } from 'next/router';
import SyncConfigsListPanel from './SyncConfigListPanel';

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
