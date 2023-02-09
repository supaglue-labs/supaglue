/** @jsxImportSource @emotion/react */
import * as RadixSwitch from '@radix-ui/react-switch';
import classnames from 'classnames';
import { useId } from 'react';
import { SupaglueProviderInternal } from '../../providers';
import { SupaglueAppearance } from '../../types';
import { styles } from './styles';

export type SwitchElements = {
  switchOn?: string;
  switchOff?: string;
  switchThumb?: string;
};

export type SwitchProps = {
  appearance?: SupaglueAppearance & {
    elements?: SwitchElements;
  };
  disabled?: boolean;
  toggled: boolean;
  onCheckedChange: (checked: boolean) => void;
  isLoading?: boolean;
  className?: string;
};

const SwitchInternal = ({
  appearance,
  disabled,
  toggled,
  onCheckedChange,
  className,
  isLoading = false,
}: SwitchProps) => {
  const inputId = useId();
  return (
    <RadixSwitch.Root
      id={inputId}
      css={toggled ? styles.switchRootOn : styles.switchRootOff}
      checked={toggled}
      className={classnames(
        'sg-switchRoot',
        className,
        toggled ? appearance?.elements?.switchOn : appearance?.elements?.switchOff
      )}
      disabled={disabled || isLoading}
      // Explicitly remove type attribute to prevent global css from resetting
      // our styles
      type={undefined}
      onCheckedChange={onCheckedChange}
    >
      <RadixSwitch.Thumb
        css={styles.switchThumb}
        className={classnames('sg-switchThumb', appearance?.elements?.switchThumb)}
      />
    </RadixSwitch.Root>
  );
};

export const Switch = (props: SwitchProps) => (
  <SupaglueProviderInternal>
    <SwitchInternal {...props} />
  </SupaglueProviderInternal>
);
