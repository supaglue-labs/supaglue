import { FC } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';

export interface TableHeaderColumnProps {
  children?: React.ReactNode;
  className?: string;
}

export const TableHeaderColumn: FC<TableHeaderColumnProps> = ({ children, className = '' }: TableHeaderColumnProps) => {
  return (
    <th
      scope="col"
      className={overrideTailwindClasses(
        `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${className}`
      )}
    >
      {children}
    </th>
  );
};
