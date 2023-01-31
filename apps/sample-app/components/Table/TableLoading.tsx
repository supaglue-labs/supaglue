import classNames from 'classnames';
import { FC } from 'react';

export interface TableLoadingProps {
  numColumns: number;
  numRows: number;
  className?: string;
}

export const TableLoading: FC<TableLoadingProps> = ({ numColumns, numRows, className }: TableLoadingProps) => {
  return (
    <>
      {[...Array(numRows)].map((_, index) => (
        <tr className="animate-pulse" key={index}>
          {[...Array(numColumns)].map((_, index) => (
            <td className={classNames('px-6 py-4', className)} key={index}>
              <div className="h-5 w-36 rounded-md"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
