import classNames from 'classnames';
import { useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SupaglueApiProviderInternal, triggerSync, useSalesforceIntegration } from '../../hooks/api';
import { useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import styles from './TriggerSyncButton.module.css';

export type TriggerSyncButtonProps = {
  syncConfigName: string;
  label?: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      buttonLabel?: string;
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
    <button
      className={classNames('sg-buttonLabel', appearance?.elements?.buttonLabel, styles.button)}
      disabled={isLoadingSync || syncingInProgress}
      type="button"
      onClick={onClick}
    >
      {syncingInProgress ? 'Syncing...' : label || 'Run sync now'}
    </button>
  ) : null;
};

export const TriggerSyncButton = (props: TriggerSyncButtonProps) => (
  <SupaglueApiProviderInternal>
    <TriggerSyncButtonInternal {...props} />
  </SupaglueApiProviderInternal>
);
