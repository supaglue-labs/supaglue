/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react';
import styles from './styles';

export const EmptyContent = ({ className, children }: { className?: string; children: ReactNode }) => {
  return (
    <p css={styles.emptyContent} className={className}>
      {children}
    </p>
  );
};
