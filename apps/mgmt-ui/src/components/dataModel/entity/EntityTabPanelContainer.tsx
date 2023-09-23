import { TabPanel } from '@/components/TabPanel';
import { useRouter } from 'next/router';
import { EntityDetailsPanel, NewEntityPanel } from './EntityDetailsPanel';
import EntitiesListPanel from './EntityListPanel';

/**
 * @deprecated
 */
export default function EntityTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;

  const isListPage = tab.length === 1;
  const isNewPage = tab.length === 2 && tab[1] === 'new';
  const isDetailPage = tab.length === 2 && tab[1] !== 'new';

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && <EntitiesListPanel />}
      {isNewPage && <NewEntityPanel />}
      {isDetailPage && <EntityDetailsPanel entityId={tab[1]} />}
    </TabPanel>
  );
}
