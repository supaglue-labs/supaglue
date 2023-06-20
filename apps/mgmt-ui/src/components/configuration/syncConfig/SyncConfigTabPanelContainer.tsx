import { TabPanel } from '@/components/TabPanel';
import { useRouter } from 'next/router';
import { NewSyncConfigPanel, SyncConfigDetailsPanel } from './SyncConfigDetailsPanel';
import SyncConfigsListPanel from './SyncConfigListPanel';

export default function SyncConfigTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;

  const isListPage = tab.length === 1;
  const isNewPage = tab.length === 2 && tab[1] === 'new';
  const isDetailPage = tab.length === 2 && tab[1] !== 'new';

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && <SyncConfigsListPanel />}
      {isNewPage && <NewSyncConfigPanel />}
      {isDetailPage && <SyncConfigDetailsPanel syncConfigId={tab[1]} />}
    </TabPanel>
  );
}
