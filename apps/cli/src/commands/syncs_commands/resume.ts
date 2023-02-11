/*
 * Resume a customer's sync:
 *
 *  $ supaglue syncs resume --customer-id 1 --sync-config-name Contacts
 *
 */

import { AxiosError } from 'axios';
import { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../../cli';
import { UserFacingError } from '../../errors';
import { axiosInstance } from '../../lib/axios';
import * as logger from '../../lib/logger';

export const command = 'resume';

export const describe = "resume a customer's sync";

export function builder(yargs: Argv) {
  yargs.option('customer-id', {
    type: 'string',
    description: 'The customer id to resume a sync for',
    demandOption: true,
  });

  yargs.option('sync-config-name', {
    type: 'string',
    description: 'The sync config name to resume',
    demandOption: true,
  });
}

type ResumeHandlerArgs = BaseArgs & {
  customerId: string;
  syncConfigName: string;
};

export const handler = async ({ customerId, syncConfigName, url }: ArgumentsCamelCase<ResumeHandlerArgs>) => {
  try {
    await axiosInstance.post(`${url}/syncs/_start`, {
      customerId,
      syncConfigName,
    });
  } catch (e: unknown) {
    if (e instanceof AxiosError && e.response?.data) {
      throw new UserFacingError(e.response?.data);
    }
    throw e;
  }

  logger.info(`Sync ${syncConfigName} for customer ${customerId} resumed`);
};
