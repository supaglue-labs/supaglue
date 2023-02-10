/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ReactNode } from 'react';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type CardElements = {
  card?: string;
};

export interface CardProps {
  children: ReactNode;
  className?: string;
  appearance?: SupaglueAppearance & {
    elements?: CardElements;
  };
}

export const Card = ({ children, className, appearance }: CardProps) => {
  return (
    <div css={styles.card} className={classNames('sg-card', className, appearance?.elements?.card)}>
      {children}
    </div>
  );
};
