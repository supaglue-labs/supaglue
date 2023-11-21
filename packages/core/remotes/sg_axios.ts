import { logger } from '@supaglue/core/lib';
import axios, { AxiosError, isAxiosError } from 'axios';

axios.interceptors.response.use(undefined, (err) => {
  logger.warn({ err }, 'axios request failed');
  return Promise.reject(err);
});

export default axios;
export { AxiosError, isAxiosError };
