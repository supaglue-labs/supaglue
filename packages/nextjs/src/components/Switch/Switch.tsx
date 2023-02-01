/** @jsxImportSource @emotion/react */
import * as RadixSwitch from '@radix-ui/react-switch';
import classnames from 'classnames';
import { useId } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync } from '../../hooks/api';
import { SupaglueInternalProvider } from '../../providers';
import { useSupaglueContext } from '../../providers/supaglueProvider';
import { SupaglueAppearance } from '../../types';
import { styles } from './styles';

type Elements = {
  switchLabel?: string;
  switchOn?: string;
  switchOff?: string;
  switchThumb?: string;
  switchWrapper?: string;
};

export type SwitchProps = {
  appearance?: SupaglueAppearance & {
    elements: Elements;
  };
  className?: string;
  disabled?: boolean;
  label?: string;
  syncConfigName: string;
};

const SwitchInternal = (props: SwitchProps) => {
  const { appearance, disabled, label, syncConfigName } = props;
  const { customerId, apiUrl } = useSupaglueContext();

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

  const { trigger: triggerUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync?.id}`, updateSync);

  return (
    <div
      css={styles.switchWrapper}
      className={classnames(props.className, 'sg-switchWrapper', appearance?.elements?.switchWrapper)}
    >
      <label className={classnames('sg-switchLabel', appearance?.elements?.switchLabel)} htmlFor={inputId}>
        {label || `Sync ${syncConfigName}`}
      </label>

      <RadixSwitch.Root
        id={inputId}
        css={syncEnabled ? styles.switchRootOn : styles.switchRootOff}
        checked={syncEnabled}
        className={classnames(
          'sg-switchRoot',
          syncEnabled ? appearance?.elements?.switchOn : appearance?.elements?.switchOff
        )}
        disabled={disabled || isLoadingSync}
        // Explicitly remove type attribute to prevent global css from resetting
        // our styles
        type={undefined}
        onCheckedChange={async (checked: boolean) => {
          const result = await triggerUpdateSync({ enabled: checked });
          if (result?.data) {
            mutate({ ...result.data });
          }
        }}
      >
        <RadixSwitch.Thumb
          css={styles.switchThumb}
          className={classnames('sg-switchThumb', appearance?.elements?.switchThumb)}
        />
      </RadixSwitch.Root>
    </div>
  );
};

export const Switch = (props: SwitchProps) => (
  <SupaglueInternalProvider>
    <SwitchInternal {...props} />
  </SupaglueInternalProvider>
);
