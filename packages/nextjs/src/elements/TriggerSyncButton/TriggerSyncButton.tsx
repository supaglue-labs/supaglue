/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { triggerSync, useSalesforceIntegration } from '../../hooks/api';
import { Button } from '../../primitives/Button';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

const TOAST_TIMEOUT_MS = 2000;

export type TriggerSyncButtonElements = {
  button?: string;
  toast?: string;
};

export type TriggerSyncButtonProps = {
  syncConfigName: string;
  label?: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      button?: string;
    };
  };
  showToast?: boolean;
};

export const TriggerSyncButtonInternal = ({
  label,
  syncConfigName,
  showToast = true,
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

  const [timeoutId, setTimeoutId] = useState<number | undefined>();
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const setToast = (message: string) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    setToastMessage(message);
    setTimeoutId(
      window.setTimeout(() => {
        setTimeoutId(undefined);
      }, TOAST_TIMEOUT_MS)
    );
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClick = async () => {
    setSyncingInProgress(true);

    const result = await trigger();

    setSyncingInProgress(false);
    if (!showToast) {
      return;
    }
    if (result?.status === 200) {
      setToast('Successfully started sync!');
    }
    if (result?.status !== 200) {
      setToast('Error encountered.');
    }
  };

  return integrationConnected ? (
    <div style={{ position: 'relative' }}>
      <Button
        className="sg-triggerSyncButton"
        appearance={appearance}
        disabled={isLoadingSync || syncingInProgress}
        onClick={onClick}
      >
        {syncingInProgress ? 'Syncing...' : label || 'Run sync now'}
      </Button>
      {timeoutId && (
        <span className="sg-triggerSyncButton-toast" css={styles.toast}>
          {toastMessage}
        </span>
      )}
    </div>
  ) : null;
};

export const TriggerSyncButton = (props: TriggerSyncButtonProps) => (
  <SupaglueProviderInternal>
    <TriggerSyncButtonInternal {...props} />
  </SupaglueProviderInternal>
);
