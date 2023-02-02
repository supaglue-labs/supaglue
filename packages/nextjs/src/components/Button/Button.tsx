/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export const Button = ({ children, className, ...otherProps }: ButtonProps) => {
  return (
    <button
      css={styles.button}
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
