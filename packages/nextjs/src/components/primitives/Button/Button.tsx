/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles, { ButtonVariantParams } from './styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variantParams?: ButtonVariantParams;
  className?: string;
}

export const Button = ({ children, variantParams, className, ...otherProps }: ButtonProps) => {
  return (
    <button
      css={styles.button(variantParams)}
      // Explicitly remove type attribute to prevent global css from resetting
      // our styles
      type={undefined}
      className={classNames('sg-button', className)}
      {...otherProps}
    >
      {children}
    </button>
  );
};
