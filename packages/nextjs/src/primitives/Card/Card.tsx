/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ReactNode } from 'react';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export interface CardProps {
  children: ReactNode;
  className?: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      card?: string;
    };
  };
}

export const Card = ({ children, className, appearance }: CardProps) => {
  return (
    <div css={styles.card} className={classNames('sg-card', className, appearance?.elements?.card)}>
      {children}
    </div>
  );
};
