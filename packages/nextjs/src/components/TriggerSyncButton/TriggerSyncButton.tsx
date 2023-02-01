import classNames from 'classnames';
import { useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SupaglueApiProvider, triggerSync, useSalesforceIntegration } from '../../hooks/api';
import { SgCacheProvider, useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import { Button } from '../Button';

export type TriggerSyncButtonProps = {
  syncConfigName: string;
  label?: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      button?: string;
    };
  };
  onSuccess?: () => void;
  onError?: () => void;
};

export const TriggerSyncButtonInternal = ({
  label,
  syncConfigName,
  onSuccess,
  onError,
  appearance,
}: TriggerSyncButtonProps) => {
  // TODO: Need a way to know if there's already a sync in process
  const [syncingInProgress, setSyncingInProgress] = useState(false);

  const { customerId, apiUrl } = useSupaglueContext();
  const { data: sync, isLoading: isLoadingSync } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfigName}`,
  });
  const { data: integration, error } = useSalesforceIntegration(customerId);
  const integrationConnected = integration && error?.response?.status !== 404;

  const { trigger } = useSWRMutation(`${apiUrl}/syncs/${sync?.id}/_trigger`, triggerSync);

  const onClick = async () => {
    setSyncingInProgress(true);

    const result = await trigger();

    setSyncingInProgress(false);
    if (result?.status === 200 && onSuccess) {
      onSuccess();
    }
    if (result?.status !== 200 && onError) {
      onError();
    }
  };

  return integrationConnected ? (
    <Button
      className={classNames('sg-triggerSyncButton', appearance?.elements?.button)}
      disabled={isLoadingSync || syncingInProgress}
      onClick={onClick}
    >
      {syncingInProgress ? 'Syncing...' : label || 'Run sync now'}
    </Button>
  ) : null;
};

export const TriggerSyncButton = (props: TriggerSyncButtonProps) => (
  <SupaglueApiProvider>
    <SgCacheProvider>
      <TriggerSyncButtonInternal {...props} />
    </SgCacheProvider>
  </SupaglueApiProvider>
);
