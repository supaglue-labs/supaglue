import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';

export interface TableCellProps {
  isStrong?: boolean;
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}

const placeholder = '-';

export const TableCell: FC<TableCellProps> = ({ children, isStrong, className, colSpan }: TableCellProps) => (
  <td
    className={overrideTailwindClasses(
      classNames(
        'whitespace-nowrap px-6 py-4 text-sm',
        {
          'font-normal': !isStrong,
          'font-medium': isStrong,
        },
        className
      )
    )}
    colSpan={colSpan ?? 1}
  >
    {children ?? placeholder}
  </td>
);
