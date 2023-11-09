import { TabPanel } from '@/components/TabPanel';
import { useLekkoConfigs } from '@/hooks/useLekkoConfigs';
import { useProviders } from '@/hooks/useProviders';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import { PROVIDER_CARDS_INFO } from '@/utils/provider';
import type { ProviderCategory, ProviderName } from '@supaglue/types';
import { useRouter } from 'next/router';
import ProviderDetailsPanel from './ProviderDetailsPanel';
import ProvidersListPanel from './ProvidersListPanel';

export default function ProviderTabPanelContainer(props: SupaglueProps) {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [_, category, providerName] = Array.isArray(tab) ? tab : [tab];
  const { providers: existingProviders = [], isLoading: isLoadingProviders } = useProviders();
  const { schemasWhitelistConfig, isLoading: isLoadingLekkoConfigs } = useLekkoConfigs();

  const isListPage = tab.length === 1;
  const isDetailPage = tab.length === 3;

  const isLoading = isLoadingProviders || isLoadingLekkoConfigs;

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && (
        <ProvidersListPanel
          isLoading={isLoading}
          providerCardsInfo={PROVIDER_CARDS_INFO}
          existingProviders={existingProviders}
          {...props}
        />
      )}
      {isDetailPage && (
        <ProviderDetailsPanel
          isLoading={isLoading}
          category={category as ProviderCategory}
          providerName={providerName as ProviderName}
          schemasWhitelistConfig={schemasWhitelistConfig}
          {...props}
        />
      )}
    </TabPanel>
  );
}
