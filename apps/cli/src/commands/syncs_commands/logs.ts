/*
 * List the sync configs from the server:
 *
 *  $ supaglue syncs logs --customer-id 1 --status error
 *
 */

import { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../../cli';
import { axiosInstance } from '../../lib/axios';
import * as logger from '../../lib/logger';

const MAX_PAGE_SIZE = 100;

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

// async generator function to get all logs
async function* getLogs({ limit = 0, customerId, status, syncConfigName, url }: LogsHandlerArgs) {
  let page = 0;
  let logsCount = 0;
  while (limit === 0 || logsCount < limit) {
    const count: number = limit === 0 ? MAX_PAGE_SIZE : Math.min(limit - logsCount, MAX_PAGE_SIZE);
    const res = await axiosInstance.get(`${url}/syncs/run_logs`, {
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

    yield res.data.logs;
    page += 1;
    logsCount += res.data.logs.length;
  }
}

export const handler = async ({
  limit = 0,
  customerId,
  status,
  syncConfigName,
  url,
}: ArgumentsCamelCase<LogsHandlerArgs>) => {
  for await (const logs of getLogs({ limit, customerId, status, syncConfigName, url })) {
    logs.forEach((log: any) =>
      logger.log(
        JSON.stringify({
          timestamp: log.startTimestamp,
          syncName: log.sync.syncConfigName,
          customerId: log.sync.customerId,
          status: log.result.status,
          errorMessage: log.result.errorMessage,
        })
      )
    );
  }
};
