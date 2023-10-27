import retry from 'async-retry';
import { isAxiosError } from 'axios';
import { logger } from '.';
import { SGTerminalTooManyRequestsError, TooManyRequestsError } from '../errors';

const isAxiosRateLimited = (e: any): boolean => {
  return isAxiosError(e) && e.response?.status === 429;
};

// Heuristic to detect free plan, daily rate limit, or hourly rate limit
const isApolloDailyHourlyRateLimited = (e: any): boolean => {
  const isFreePlan = e.response.data.includes('This endpoint is only available to paying teams');
  const isDailyHourlyRateLimited =
    /^The maximum number of api calls allowed for [a-z0-9/]+ is [0-9]+ times per (hour|day). Please upgrade your plan/.test(
      e.response.data
    );
  return isFreePlan || isDailyHourlyRateLimited;
};

export const retryWhenAxiosApolloRateLimited = async <Args extends any[], Return>(
  operation: (...operationParameters: Args) => Return,
  ...parameters: Args
): Promise<Return> => {
  const helper = async (bail: (e: Error) => void) => {
    try {
      return await operation(...parameters);
    } catch (e: any) {
      // bail on terminal rate limits (hourly or daily or free plan)
      // throw TerminalTooManyRequestsError for run_object_sync to rethrow a temporal non retryable error
      if (isAxiosRateLimited(e) && isApolloDailyHourlyRateLimited(e)) {
        logger.warn({ errror: e }, `Encountered Apollo hourly or daily rate limiting.`);
        bail(new SGTerminalTooManyRequestsError(`Encountered Apollo hourly or daily rate limiting.`));
        return null as Return;
      }

      // continue to retry on minutely rate limits
      if (isAxiosRateLimited(e)) {
        logger.warn({ errror: e }, `Encountered Apollo rate limiting.`);
        throw new TooManyRequestsError(`Encountered Apollo rate limiting.`);
      }

      // stop retrying on others
      logger.warn({ error: e }, `Encountered Apollo error.`);
      bail(e);
      return null as Return;
    }
  };
  return await retry(helper, {
    retries: 5, // expo backoff for up to a minute
    factor: 2,
    // create some jitter so concurrent apollo syncs can make progress
    randomize: true,
    minTimeout: 2000,
  });
};
