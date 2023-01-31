/*
 * List the sync configs from the server:
 *
 *  $ supaglue sync-configs list
 *
 */

import { AxiosError } from 'axios';
import { table } from 'table';
import { ArgumentsCamelCase } from 'yargs';
import type { BaseArgs } from '../../cli';
import { axiosInstance } from '../../lib/axios';
import * as logger from '../../lib/logger';

export const command = 'list';

export const describe = 'list sync configurations on the server';

type ListHandlerArgs = BaseArgs;

export const handler = async (args: ArgumentsCamelCase<ListHandlerArgs>) => {
  let syncConfigs;
  try {
    const res = await axiosInstance.get(`${args.url}/developer_config`);
    ({ syncConfigs } = res.data);
  } catch (e) {
    // ignore if 404
    if ((e instanceof AxiosError && e.response?.status !== 404) || !(e instanceof AxiosError)) {
      throw e;
    }
  }

  if (!syncConfigs) {
    logger.warn('No sync configs found');
    return;
  }

  logger.info('Sync configs:');
  // eslint-disable-next-line no-console
  console.log(
    table([['Name', 'Schedule', 'Status'], ...syncConfigs.map((c: any) => [c.name, c.cronExpression, 'Live'])])
  );
};
