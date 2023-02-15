/** @jsxImportSource @emotion/react */
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
import styles from './styles';

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

  if (!developerConfig?.syncConfigs?.length) {
    return <EmptyContent>No developer config found.</EmptyContent>;
  }

  const syncConfig = developerConfig.syncConfigs.find(({ name }) => name === syncConfigName);

  if (!sync || !syncConfig) {
    return <EmptyContent>No sync found.</EmptyContent>;
  }

  return (
    <Card css={styles.card} appearance={appearance}>
      <SyncSwitch includeSyncDescription syncConfig={syncConfig} appearance={appearance} />
      <FieldMapping syncConfig={syncConfig} appearance={appearance} />
      <TriggerSyncButton syncConfig={syncConfig} appearance={appearance} />
    </Card>
  );
};

export const SyncConfigCard = (props: SupaglueConfigCardProps) => (
  <SupaglueProviderInternal>
    <SyncConfigCardInternal {...props} />
  </SupaglueProviderInternal>
);
