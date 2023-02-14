/** @jsxImportSource @emotion/react */
import classnames from 'classnames';
import cronstrue from 'cronstrue';
import { useId } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync } from '../../hooks/api';
import { DeveloperConfig } from '../../lib/types';
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
  syncConfigName: string;
};

const SyncSwitchInternal = (props: SyncSwitchProps) => {
  const { appearance, disabled, includeSyncDescription, label, syncConfigName } = props;
  const { customerId, apiUrl } = useSupaglueContext();

  const { data: developerConfig } = useSWR<DeveloperConfig>({ path: '/developer_config' });

  // TODO: Use conditional fetching syntax
  const {
    data: sync,
    isLoading: isLoadingSync,
    mutate,
  } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfigName}`,
  });

  const inputId = useId();

  const syncEnabled = !!sync?.enabled;
  const syncConfig = developerConfig?.syncConfigs.find(({ name }) => name === syncConfigName);

  const { trigger: triggerUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync?.id}`, updateSync);

  const onCheckedChange = async (checked: boolean) => {
    const result = await triggerUpdateSync({ enabled: checked });
    if (result?.data) {
      await mutate({ ...result.data });
    }
  };

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
          {label || `Sync ${syncConfigName}`}
        </label>

        <Switch
          disabled={disabled}
          isLoading={isLoadingSync}
          toggled={syncEnabled}
          appearance={appearance}
          onCheckedChange={onCheckedChange}
        />
      </div>

      {includeSyncDescription && syncConfig && (
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
