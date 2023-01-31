import classNames from 'classnames';

export function Pagination({
  setPageIndex,
  pageIndex,
  maxPageSize = 10,
  isLoading = false,
  count,
}: {
  setPageIndex: (pageIndex: number) => void;
  pageIndex: number;
  maxPageSize?: number;
  isLoading?: boolean;
  count?: number;
}) {
  const to = pageIndex * maxPageSize + maxPageSize;
  return (
    <nav
      className={classNames(
        'flex items-center justify-between bg-base-200 border-t border-base-100 px-4 py-3 sm:rounded-b-lg sm:px-6',
        {
          'child:cursor-wait': isLoading,
        }
      )}
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm">
          Showing results <span className="font-medium">{pageIndex * maxPageSize + 1}</span> to{' '}
          <span className="font-medium">{to < (count ?? 0) ? to : count}</span>
          {count !== undefined && (
            <>
              {' '}
              of <span className="font-medium">{count}</span>
            </>
          )}
        </p>
      </div>
      <div className="btn-group grid grid-cols-2">
        <button
          className="btn btn-outline btn-sm"
          disabled={pageIndex === 0}
          onClick={() => pageIndex !== 0 && setPageIndex(pageIndex - 1)}
        >
          Previous page
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={count !== undefined && pageIndex * maxPageSize + maxPageSize >= count}
        >
          Next page
        </button>
      </div>
    </nav>
  );
}
