import { ChevronDownIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { FC, Fragment, ReactNode, useState } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';
import { Spinner } from '../Spinner';
import { Button } from './Button';
import { EmptyTable } from './EmptyTable';
import { TableHeaderColumn } from './TableHeaderColumn';

type ColumnConfig = {
  name: string;
  className?: string;
  isSortable?: boolean;
};

export type SortState = {
  sortBy: string;
  isDescending: boolean;
};

type SortConfig = {
  onSort: (sortState: SortState) => void;
  initialSortState?: SortState;
};

const EmptyRow = ({
  numColumns,
  isError,
  className,
  message,
}: {
  numColumns: number;
  isError: boolean;
  className?: string;
  message: string;
}) => (
  <tr>
    <td
      colSpan={numColumns}
      className={classNames({
        'text-red-600': isError,
        'text-gray-500': !isError,
      })}
    >
      {message}
    </td>
  </tr>
);

const LoadingRow = ({ numColumns, className }: { numColumns: number; className?: string }) => (
  <tr className="animate-pulse">
    {[...Array(numColumns)].map((_, index) => (
      <td className={classNames('px-6 py-4', className)} key={index}>
        <div className="h-5 w-36 rounded-md bg-neutral-content"></div>
      </td>
    ))}
  </tr>
);

const isMessageString = (message: string | ReactNode): message is string => typeof message === 'string';

export interface TableProps {
  className?: string | Record<string, boolean>;
  columns: ColumnConfig[];
  isError?: boolean;
  isLoading?: boolean;
  errorMessage?: string | ReactNode;
  emptyMessage?: string | ReactNode;
  rows: any[];
  numPlaceholderRows?: number;
  sortConfig?: SortConfig;
  pagination?: ReactNode;
}

export const Table: FC<TableProps> = ({
  className,
  columns = [],
  isError,
  isLoading,
  errorMessage = 'An error occurred.',
  emptyMessage = 'No results.',
  rows = [],
  numPlaceholderRows = 4,
  sortConfig,
  pagination,
}: TableProps) => {
  const [sortState, setSortState] = useState<SortState | undefined>(sortConfig?.initialSortState);

  const shouldShowLoadingState = !isError && isLoading;
  const shouldShowPlaceHolderState = !isError && isLoading && rows.length === 0;

  if (isLoading && rows.length === 0) {
    rows = Array(numPlaceholderRows).fill(null);
  }

  const shouldShowEmptyState = !isError && !isLoading && rows.length === 0;
  const shouldShowSuccessState = !isError && (!isLoading || rows.length > 0);
  const shouldShowErrorState = isError;

  return (
    <div className={overrideTailwindClasses(classNames('relative overflow-y-auto shadow-sm sm:rounded-lg', className))}>
      {shouldShowLoadingState && <Spinner className="absolute right-3 top-2 h-6 w-6" />}
      <table className={classNames('table w-full', { 'cursor-wait': isLoading })}>
        <thead>
          <tr>
            {columns.map((column: ColumnConfig, idx: number) => (
              <TableHeaderColumn key={idx} className={column.className}>
                {sortConfig && (
                  <SortableTableHeaderContent
                    params={column}
                    sortState={sortState}
                    setSortState={setSortState}
                    onSort={sortConfig.onSort}
                  />
                )}
                {!sortConfig && column.name}
              </TableHeaderColumn>
            ))}
          </tr>
        </thead>
        <tbody>
          <Fragment>
            {shouldShowEmptyState && isMessageString(emptyMessage) && (
              <EmptyRow message={emptyMessage} isError={isError ?? false} numColumns={columns.length} />
            )}
            {shouldShowEmptyState && !isMessageString(emptyMessage) && emptyMessage}
            {shouldShowPlaceHolderState &&
              rows.map((_, index) => <LoadingRow key={index} numColumns={columns.length} />)}
            {shouldShowSuccessState && rows}
            {shouldShowErrorState && isMessageString(errorMessage) && (
              <EmptyTable numColumns={columns.length} isError message={errorMessage} />
            )}
            {shouldShowErrorState && !isMessageString(errorMessage) && errorMessage}
          </Fragment>
        </tbody>
      </table>
      {pagination}
    </div>
  );
};

type SortableTableHeaderContentProps = {
  params: ColumnConfig;
  setSortState: (sortState: SortState) => void;
  sortState: SortState | undefined;
  onSort: (sortState: SortState) => void;
};

const SortableTableHeaderContent = ({ params, setSortState, sortState, onSort }: SortableTableHeaderContentProps) => {
  const { name, isSortable } = params;

  const onClickHeader = () => {
    if (!isSortable || !name) {
      return;
    }
    let newSortState = sortState;
    if (sortState && sortState.sortBy === name) {
      newSortState = { ...sortState, isDescending: !sortState.isDescending };
    } else {
      newSortState = { sortBy: name, isDescending: false };
    }
    setSortState(newSortState);
    onSort(newSortState);
  };

  if (!isSortable) {
    return <p>{name}</p>;
  }
  return (
    <Button variant="unstyled" onClick={onClickHeader}>
      <div className="flex flex-row items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wider">{name}</p>
        {sortState && name === sortState.sortBy && (
          <ChevronDownIcon className={classNames('h-4 w-4', { 'rotate-180 transform': !sortState.isDescending })} />
        )}
      </div>
    </Button>
  );
};
