/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { SupaglueAppearance } from '../../types';
import styles, { ButtonVariantParams } from './styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variantParams?: ButtonVariantParams;
  appearance?: SupaglueAppearance & {
    elements?: {
      button?: string;
    };
  };
}

export const Button = ({ children, variantParams, className, appearance, ...otherProps }: ButtonProps) => {
  return (
    <button
      css={styles.button(variantParams)}
      // Explicitly remove type attribute to prevent global css from resetting
      // our styles
      type={undefined}
      className={classNames('sg-button', className, appearance?.elements?.button)}
      {...otherProps}
    >
      {children}
    </button>
  );
};
