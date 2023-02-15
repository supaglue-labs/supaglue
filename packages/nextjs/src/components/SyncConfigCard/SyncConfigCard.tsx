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
import { useIntegration } from '../../hooks/api';
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
  const { data: integration, error, isLoading: isLoadingIntegration } = useIntegration(customerId, 'salesforce');

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
      <div
        style={{
          boxSizing: 'inherit',
          position: 'relative',
          transformOrigin: 'left bottom',
          transform: 'rotate(-90deg) translateX(-10rem)',
          borderRadius: '0.5em 0.5em 0px 0px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05);',
          left: '-25px',
          top: '-100%',
          bottom: 'unset',
          padding: '0.375rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.5rem',
          backgroundColor: 'hsl(226, 70.0%, 55.5%)',
        }}
      >
        <p
          style={{
            fontSize: '0.625rem',
            letterSpacing: '0px',
            lineHeight: 1,
            fontWeight: 400,
            margin: '0px',
            color: 'white',
          }}
        >
          Powered by Supaglue
        </p>
      </div>
    </Card>
  );
};

export const SyncConfigCard = (props: SupaglueConfigCardProps) => (
  <SupaglueProviderInternal>
    <SyncConfigCardInternal {...props} />
  </SupaglueProviderInternal>
);
