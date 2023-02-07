/*
 * List the sync configs from the server:
 *
 *  $ supaglue syncs logs --customer-id 1 --status error
 *
 */

import { table } from 'table';
import { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../../cli';
import { axiosInstance } from '../../lib/axios';
import * as logger from '../../lib/logger';

export const command = 'logs';

export const describe = 'get a log of sync runs';

export function builder(yargs: Argv) {
  yargs.option('customer-id', {
    type: 'string',
    description: 'The customer id filter logs on',
  });

  yargs.option('status', {
    type: 'string',
    description: 'The status to filter logs on',
  });

  yargs.option('sync-config-name', {
    type: 'string',
    description: 'The sync config name to filter logs on',
  });

  yargs.option('limit', {
    type: 'number',
    description: 'The number of logs to return',
  });
}

type LogsHandlerArgs = BaseArgs & {
  customerId?: string;
  status?: string;
  syncConfigName?: string;
  limit?: number;
};

export const handler = async (args: ArgumentsCamelCase<LogsHandlerArgs>) => {
  const logs = [];
  const { limit = 0, customerId, status, syncConfigName } = args;
  const MAX_PAGE_SIZE = 100;

  let page = 0;
  while (limit === 0 || logs.length < limit) {
    const count: number = limit === 0 ? MAX_PAGE_SIZE : Math.min(limit - logs.length, MAX_PAGE_SIZE);
    const res = await axiosInstance.get(`${args.url}/syncs/run_logs`, {
      params: {
        customerId,
        status,
        syncConfigName,
        page,
        count,
      },
    });

    if (res.data.logs.length === 0) {
      break;
    }

    logs.push(...res.data.logs);
    page += 1;
  }

  if (logs.length === 0) {
    logger.warn(`No logs found`);
    return;
  }

  logger.log(
    table([
      ['Timestamp', 'Sync Name', 'Customer Id', 'Status', 'Message'],
      ...logs.map((s: any) => {
        return [
          s.startTimestamp,
          s.sync.syncConfigName,
          s.sync.customerId,
          s.result.status,
          s.result.errorMessage ?? 'N/A',
        ];
      }),
    ])
  );
};
