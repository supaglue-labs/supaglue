import retry from 'async-retry';
import { isAxiosError } from 'axios';
import { ASYNC_RETRY_OPTIONS, logger } from '.';
import { TooManyRequestsError } from '../errors';

export const isAxiosRateLimited = (e: any): boolean => {
  return isAxiosError(e) && e.response?.status === 429;
};

export const retryWhenAxiosRateLimited = async <Args extends any[], Return>(
  operation: (...operationParameters: Args) => Return,
  ...parameters: Args
): Promise<Return> => {
  const helper = async (bail: (e: Error) => void) => {
    try {
      return await operation(...parameters);
    } catch (e: any) {
      if (isAxiosRateLimited(e)) {
        logger.warn(e, `Encountered provider rate limiting.`);
        throw new TooManyRequestsError(`Encountered provider rate limiting.`);
      }

      logger.warn(e, `Encountered provider error.`);
      bail(e);
      return null as Return;
    }
  };
  return await retry(helper, ASYNC_RETRY_OPTIONS);
};
