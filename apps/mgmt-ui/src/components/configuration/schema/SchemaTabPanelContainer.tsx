import { TabPanel } from '@/components/TabPanel';
import { useRouter } from 'next/router';
import { NewSchemaPanel, SchemaDetailsPanel } from './SchemaDetailsPanel';
import SchemasListPanel from './SchemaListPanel';

export default function SchemaTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;

  const isListPage = tab.length === 1;
  const isNewPage = tab.length === 2 && tab[1] === 'new';
  const isDetailPage = tab.length === 2 && tab[1] !== 'new';

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && <SchemasListPanel />}
      {isNewPage && <NewSchemaPanel />}
      {isDetailPage && <SchemaDetailsPanel schemaId={tab[1]} />}
    </TabPanel>
  );
}
