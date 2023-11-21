import retry from 'async-retry';
import { isAxiosError } from 'axios';
import { ASYNC_RETRY_OPTIONS, logger } from '.';
import { TooManyRequestsError } from '../errors';

const isAxiosRateLimited = (e: any): boolean => {
  return isAxiosError(e) && e.response?.status === 429;
};

export const retryWhenAxiosRateLimited = async <Args extends any[], Return>(
  operation: () => Return,
  retryOptions: Parameters<typeof retry>[1] = ASYNC_RETRY_OPTIONS
): Promise<Return> => {
  const helper = async (bail: (e: Error) => void) => {
    try {
      return await operation();
    } catch (e: any) {
      // keep retrying when encountering rate limiting errors
      if (isAxiosRateLimited(e)) {
        logger.warn(e, `Encountered provider rate limiting.`);
        throw new TooManyRequestsError(`Encountered provider rate limiting.`);
      }

      // don't retry on other errors
      logger.warn(e, `Encountered provider error.`);
      bail(e);
      return null as Return;
    }
  };
  return await retry(helper, retryOptions);
};
