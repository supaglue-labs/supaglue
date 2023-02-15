/** @jsxImportSource @emotion/react */
import { Sync, SyncConfig } from '@supaglue/types';
import classnames from 'classnames';
import cronstrue from 'cronstrue';
import { useId } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync } from '../../hooks/api';
import { Switch, SwitchElements } from '../../primitives/Switch';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type SyncSwitchElements = SwitchElements & {
  switchDescription?: string;
  switchLabel?: string;
  switchWrapper?: string;
};

export type SyncSwitchProps = {
  appearance?: SupaglueAppearance & {
    elements?: SyncSwitchElements;
  };
  className?: string;
  disabled?: boolean;
  includeSyncDescription?: boolean;
  label?: string;
  syncConfig: SyncConfig;
};

const SyncSwitchInternal = (props: SyncSwitchProps) => {
  const { appearance, disabled, includeSyncDescription, label, syncConfig } = props;
  const { customerId, apiUrl } = useSupaglueContext();

  // TODO: Use conditional fetching syntax
  const {
    data: sync,
    isLoading: isLoadingSync,
    mutate,
  } = useSWR<Sync>({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  const inputId = useId();

  const syncEnabled = !!sync?.enabled;

  const { trigger: triggerUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync?.id}`, updateSync);

  const onCheckedChange = async (checked: boolean) => {
    const result = await triggerUpdateSync({ enabled: checked });
    if (result?.data) {
      await mutate({ ...result.data });
    }
  };

  // Realtime syncs not supported on the FE yet.
  if (!syncConfig || syncConfig.type === 'realtime_inbound') {
    return null;
  }

  return (
    <>
      <div
        css={styles.switchWrapper}
        className={classnames(props.className, 'sg-switchWrapper', appearance?.elements?.switchWrapper)}
      >
        <label
          css={styles.switchlabel}
          className={classnames('sg-switchLabel', appearance?.elements?.switchLabel)}
          htmlFor={inputId}
        >
          {label || `Sync ${syncConfig.name}`}
        </label>

        <Switch
          disabled={disabled}
          isLoading={isLoadingSync}
          toggled={syncEnabled}
          appearance={appearance}
          onCheckedChange={onCheckedChange}
        />
      </div>

      {includeSyncDescription && (
        <p
          className={classnames('sg-switchDescription', appearance?.elements?.switchDescription)}
          css={styles.switchDescription}
        >
          {`${syncConfig.strategy === 'full_refresh' ? 'Fully refresh' : 'Sync'} all updated contacts ${cronstrue
            .toString(syncConfig.cronExpression)
            .toLowerCase()}`}
          .
        </p>
      )}
    </>
  );
};

export const SyncSwitch = (props: SyncSwitchProps) => (
  <SupaglueProviderInternal>
    <SyncSwitchInternal {...props} />
  </SupaglueProviderInternal>
);
