/*
 * List the sync configs from the server:
 *
 *  $ supaglue syncs list --customer-id 1
 *
 */

import { AxiosError } from 'axios';
import chalk from 'chalk';
import cronParser from 'cron-parser';
import { table } from 'table';
import { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../../cli';
import { axiosInstance } from '../../lib/axios';
import * as logger from '../../lib/logger';

export const command = 'list';

export const describe = 'list syncs running on the server';

export function builder(yargs: Argv) {
  yargs.option('customer-id', {
    type: 'string',
    description: 'The customer id to list syncs for',
    required: true,
  });
}

type ListHandlerArgs = BaseArgs;

export const handler = async (args: ArgumentsCamelCase<ListHandlerArgs>) => {
  let syncs;
  try {
    const res = await axiosInstance.get(`${args.url}/syncs`, { params: { customerId: args.customerId } });
    syncs = res.data;
  } catch (e) {
    // ignore if 404
    if ((e instanceof AxiosError && e.response?.status !== 404) || !(e instanceof AxiosError)) {
      throw e;
    }
  }

  if (!syncs || syncs.length === 0) {
    logger.warn(`No syncs for customer ${args.customerId} found`);
    return;
  }

  let syncConfigs: any[] = [];
  try {
    const res = await axiosInstance.get(`${args.url}/developer_config`);
    ({ syncConfigs } = res.data);
  } catch (e) {
    // ignore if 404
    if ((e instanceof AxiosError && e.response?.status !== 404) || !(e instanceof AxiosError)) {
      throw e;
    }
  }

  logger.info(`Syncs for customer ${args.customerId}`);
  // eslint-disable-next-line no-console
  console.log(
    table([
      ['Sync Name', 'Enabled', 'Last Run', 'Next Run'],
      ...syncs.map((s: any) => {
        const cronExpression = syncConfigs.find((c) => c.name === s.syncConfigName)?.cronExpression;
        let nextRun = 'n/a';
        if (s.enabled && cronExpression) {
          nextRun = cronParser.parseExpression(cronExpression).next().toISOString();
        }
        return [
          s.syncConfigName,
          s.enabled ? chalk.green('Yes') : chalk.red('No'),
          s.SyncRun[0]
            ? s.SyncRun[0].finishTimestamp
              ? `${s.SyncRun[0].finishTimestamp}${s.SyncRun[0].status === 'error' ? ' (error)' : ''}`
              : `running (started: ${s.SyncRun[0].startTimestamp})`
            : 'n/a',
          nextRun,
        ];
      }),
    ])
  );
};
