import * as RadixSwitch from '@radix-ui/react-switch';
import classnames from 'classnames';
import { useId } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SupaglueApiProviderInternal, updateSync } from '../../hooks/api';
import { useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import styles from './Switch.module.css';

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
      className={classnames(
        props.className,
        styles.switchWrapper,
        'sg-switchWrapper',
        appearance?.elements?.switchWrapper
      )}
    >
      <label
        className={classnames(styles.switchLabel, 'sg-switchLabel', appearance?.elements?.switchLabel)}
        htmlFor={inputId}
      >
        {label || `Sync ${syncConfigName}`}
      </label>

      <RadixSwitch.Root
        id={inputId}
        checked={syncEnabled}
        className={classnames(
          'sg-switchRoot',
          syncEnabled ? appearance?.elements?.switchOn : appearance?.elements?.switchOff,
          syncEnabled ? styles.switchRootOn : styles.switchRootOff
        )}
        disabled={disabled || isLoadingSync}
        onCheckedChange={async (checked: boolean) => {
          const result = await triggerUpdateSync({ enabled: checked });
          if (result?.data) {
            mutate({ ...result.data });
          }
        }}
      >
        <RadixSwitch.Thumb
          className={classnames(styles.switchThumb, 'sg-switchThumb', appearance?.elements?.switchThumb)}
        />
      </RadixSwitch.Root>
    </div>
  );
};

export const Switch = (props: SwitchProps) => (
  <SupaglueApiProviderInternal>
    <SwitchInternal {...props} />
  </SupaglueApiProviderInternal>
);
