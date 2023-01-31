/*
 * Manage the sync configs on the server:
 *
 *  $ supaglue sync-configs
 *
 */

import { Argv } from 'yargs';

export const command = 'sync-configs';

export const describe = 'manage sync configurations on the server';

export function builder(yargs: Argv) {
  yargs
    .commandDir('sync-configs', { extensions: process.env.DEV_CLI ? ['ts'] : ['js'] })
    .demandCommand(1, 'You must specify a subcommand');
}
