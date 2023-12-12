import type { Readable } from 'stream';
import { PassThrough } from 'stream';

type PaginatorImpl<T> = (cursor?: string) => Promise<T>;

type GetResponseResults<T> = (response: T) => Readable;

type GetNextCursor<T> = (response: T) => string | undefined;

/**
 * `paginator` is a utility function that handles pagination for multiple data fetchers.
 * It iterates through the provided fetchers and their respective handlers, fetching data
 * and processing results until no more results are available.
 *
 * @param {Array} fetchersAndHandlers - An array of objects containing:
 *   - `pageFetcher`: A function that fetches data and returns a Promise that resolves to
 *                    the paginated response.
 *   - `createStreamFromPage`: A function that takes the paginated response as input and
 *                           returns a Readable stream of processed results.
 *   - `getNextCursorFromPage`: A function that takes the paginated response as input and returns
 *                      the cursor for the next set of results, if available.
 *
 * @returns {Promise<Readable>} A Readable stream of results from all fetchers combined.
 *
 * @example
 * const fetchersAndHandlers = [
 *   {
 *     pageFetcher: fetchData1,
 *     createStreamFromPage: processResults1,
 *     getNextCursorFromPage: getCursor1,
 *   },
 *   {
 *     pageFetcher: fetchData2,
 *     createStreamFromPage: processResults2,
 *     getNextCursorFromPage: getCursor2,
 *   },
 * ];
 *
 * const resultsStream = await paginator(fetchersAndHandlers);
 * resultsStream.pipe(someWritableStream);
 */
export async function paginator<T>(
  fetchersAndHandlers: {
    pageFetcher: PaginatorImpl<T>;
    createStreamFromPage: GetResponseResults<T>;
    getNextCursorFromPage: GetNextCursor<T>;
  }[]
): Promise<Readable> {
  const passThrough = new PassThrough({ objectMode: true });

  (async () => {
    const lastIndex = fetchersAndHandlers.length - 1;

    for (const [index, { pageFetcher, createStreamFromPage, getNextCursorFromPage }] of fetchersAndHandlers.entries()) {
      let cursor: string | undefined = undefined;

      do {
        let response: Awaited<T>;

        // abort the stream early if we encounter a terminal error during pagination
        try {
          response = await pageFetcher(cursor);
        } catch (e: any) {
          if (e.problemType === 'SG_TERMINAL_TOO_MANY_REQUESTS_ERROR') {
            passThrough.destroy(e);
            return;
          }
          throw e;
        }

        const readable = createStreamFromPage(response);
        cursor = getNextCursorFromPage(response);

        readable.pipe(passThrough, { end: index === lastIndex && !cursor });
        readable.on('error', (err) => passThrough.destroy(err));

        await new Promise((resolve) => readable.on('end', resolve));
      } while (cursor);
    }
  })().catch((err) => {
    passThrough.destroy(err);
  });

  return passThrough;
}
