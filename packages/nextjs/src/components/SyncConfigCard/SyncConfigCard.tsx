import useSWR from 'swr';
import {
  FieldMapping,
  FieldMappingElements,
  SyncSwitch,
  SyncSwitchElements,
  TriggerSyncButton,
  TriggerSyncButtonElements,
} from '../../elements';
import { useSalesforceIntegration } from '../../hooks/api';
import { DeveloperConfig } from '../../lib';
import { Card, CardElements, EmptyContent } from '../../primitives';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { SupaglueAppearance } from '../../types';

export type SupaglueConfigCardProps = {
  syncConfigName: string;
  appearance?: SupaglueAppearance & {
    elements?: SyncSwitchElements & TriggerSyncButtonElements & CardElements & FieldMappingElements;
  };
};

const SyncConfigCardInternal = ({ syncConfigName, appearance }: SupaglueConfigCardProps) => {
  const { customerId } = useSupaglueContext();
  const { data: integration, error, isLoading: isLoadingIntegration } = useSalesforceIntegration(customerId);

  const { data: developerConfig, isLoading: isLoadingDeveloperConfig } = useSWR<DeveloperConfig>({
    path: '/developer_config',
  });

  // TODO: Use conditional fetching syntax
  const { data: sync, isLoading: isLoadingSync } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfigName}`,
  });

  if (error) {
    return null;
  }

  if (isLoadingDeveloperConfig || isLoadingSync || isLoadingIntegration) {
    return <EmptyContent>Loading...</EmptyContent>;
  }

  if (!integration) {
    return <EmptyContent>Not connected to Salesforce. Please connect to Salesforce first.</EmptyContent>;
  }

  if (!sync) {
    return <EmptyContent>No sync found.</EmptyContent>;
  }

  if (!developerConfig?.syncConfigs?.length) {
    return <EmptyContent>No developer config found.</EmptyContent>;
  }

  return (
    <Card appearance={appearance}>
      <TriggerSyncButton syncConfigName={syncConfigName} appearance={appearance} />
      <SyncSwitch includeSyncDescription syncConfigName={syncConfigName} appearance={appearance} />
      <FieldMapping syncConfigName={syncConfigName} appearance={appearance} />
    </Card>
  );
};

export const SyncConfigCard = (props: SupaglueConfigCardProps) => (
  <SupaglueProviderInternal>
    <SyncConfigCardInternal {...props} />
  </SupaglueProviderInternal>
);
