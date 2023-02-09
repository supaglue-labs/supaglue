/** @jsxImportSource @emotion/react */
import * as RadixSelect from '@radix-ui/react-select';
import classnames from 'classnames';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type SelectElements = {
  selectTrigger?: string;
  selectContent?: string;
  selectViewport?: string;
  selectItem?: string;
  selectLoading?: string;
};

export type SelectOption = { disabled?: boolean; label?: string; name: string };

export type SelectProps = {
  disabled?: boolean;
  label: string;
  onValueChange: (value: string) => Promise<void>;
  options: SelectOption[];
  value: string;
  isLoading?: boolean;
  appearance?: SupaglueAppearance & {
    elements?: SelectElements;
  };
};

const Select = ({ appearance, label, options, value, isLoading, disabled, ...props }: SelectProps) => (
  <RadixSelect.Root {...props} value={value} disabled={disabled || isLoading}>
    <RadixSelect.Trigger
      css={styles.selectTrigger}
      className={classnames('sg-selectTrigger', appearance?.elements?.selectTrigger)}
      // Explicitly remove type attribute to prevent global css from resetting
      // our styles
      type={undefined}
      disabled={isLoading}
      aria-label={label}
    >
      {isLoading ? (
        <p css={styles.selectLoading} className={classnames('sg-selectLoading', appearance?.elements?.selectLoading)}>
          Loading...
        </p>
      ) : (
        <>
          <RadixSelect.Value asChild>
            <span>{options.find((option) => option.name === value)?.label || value}</span>
          </RadixSelect.Value>
          <RadixSelect.Icon>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </RadixSelect.Icon>
        </>
      )}
    </RadixSelect.Trigger>
    <RadixSelect.Portal>
      <RadixSelect.Content
        css={styles.selectContent}
        className={classnames('sg-selectContent', appearance?.elements?.selectContent)}
      >
        <RadixSelect.Viewport
          css={styles.selectViewport}
          className={classnames('sg-selectViewport', appearance?.elements?.selectViewport)}
        >
          {options.map((option, idx) => (
            <RadixSelectItem
              className={classnames('sg-selectItem', appearance?.elements?.selectItem)}
              key={idx}
              {...option}
            />
          ))}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
);

Select.displayName = 'Select';

export { Select };

const RadixSelectItem = ({ disabled, name, label }: SelectOption & { className?: string }) => (
  <RadixSelect.Item css={styles.selectItem} disabled={disabled} value={name}>
    <RadixSelect.ItemText>{label || name}</RadixSelect.ItemText>
  </RadixSelect.Item>
);

RadixSelectItem.displayName = 'RadixSelectItem';
