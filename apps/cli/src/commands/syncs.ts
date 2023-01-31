/*
 * Manage the sync configs on the server:
 *
 *  $ supaglue sync-configs
 *
 */

import { Argv } from 'yargs';

export const command = 'syncs';

export const describe = 'manage syncs running on the server';

export function builder(yargs: Argv) {
  yargs
    .commandDir('syncs', { extensions: process.env.DEV_CLI ? ['ts'] : ['js'] })
    .demandCommand(1, 'You must specify a subcommand');
}
