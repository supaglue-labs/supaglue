import classNames from 'classnames';
import { FC } from 'react';

export interface EmptyTableProps {
  className?: string;
  numColumns: number;
  isError?: boolean;
  message: string;
}

export const EmptyTable: FC<EmptyTableProps> = ({ numColumns, isError, className, message }: EmptyTableProps) => {
  return (
    <tr>
      <td
        colSpan={numColumns}
        className={`${className} whitespace-nowrap px-6 py-4 text-center text-sm font-medium ${classNames({
          'text-red-600': isError,
          'text-gray-500': !isError,
        })}`}
      >
        {message}
      </td>
    </tr>
  );
};
