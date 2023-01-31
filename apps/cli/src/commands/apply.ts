/*
 * Upload a workflow configuration file to the server:
 *
 *  $ supaglue apply examples/sample-app
 *
 */

import { AxiosError } from 'axios';
import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { Spinner } from 'clui';
import * as diff from 'diff';
import path from 'path';
import { table } from 'table';
import { promisify } from 'util';
import { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../cli';
import { UserFacingError } from '../errors';
import { axiosInstance } from '../lib/axios';
import * as logger from '../lib/logger';

export const command = 'apply [module]';

export const describe = 'send configurations to the server';

const exec = promisify(execCallback);

const ACTION_UPDATED = 'Updated';
const ACTION_CREATED = chalk.green('Created');
const ACTION_DELETED = chalk.red('Deleted');
const ACTION_NO_CHANGE = chalk.yellow('No Change');

export function builder(yargs: Argv) {
  yargs
    .positional('module', {
      description: 'path to the module with config',
      type: 'string',
      default: process.cwd(),
      defaultDescription: 'current working directory',
      normalize: true,
    })
    .option('diff', {
      description: 'show the diff between the local and remote configuration',
      type: 'boolean',
      default: true,
      hidden: true,
    })
    .option('no-diff', {
      type: 'boolean',
      describe: "don't show the diff between the local and remote configuration",
    });
}

type ApplyHandlerArgs = BaseArgs & {
  module: string;
};

export const handler = async (args: ArgumentsCamelCase<ApplyHandlerArgs>) => {
  const { module } = args;

  const loadingSpinner = new Spinner('Loading configuration...', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
  loadingSpinner.start();
  try {
    loadingSpinner.message('Validating typescript...');
    const tscPath = path.join(__dirname, '../../node_modules/.bin/tsc');
    await exec(`${tscPath} --noEmit ${module}/index.ts`, {
      encoding: 'utf8',
    });
  } catch (e: any) {
    const { stdout } = e;
    loadingSpinner.stop();
    throw new UserFacingError('Typescript error:', [stdout]);
  }

  let json;
  try {
    loadingSpinner.message('Reading configuration...');
    const tsxPath = path.join(__dirname, '../../node_modules/.bin/tsx');
    const { stdout: output } = await exec(`${tsxPath} ${module}/index.ts`, { encoding: 'utf8' });
    json = JSON.parse(output);
  } catch (e: any) {
    const { stderr } = e;
    loadingSpinner.stop();
    throw new UserFacingError('Error reading configuration:', [stderr]);
  } finally {
    loadingSpinner.stop();
  }

  const statuses = await handlerForFile(args, json);
  logger.log();
  logger.log(table([['Name', 'Action', 'Status'], ...statuses.map((s) => [s.name, s.action, s.status])]));

  // output counts of each action
  const counts = statuses.reduce(
    (acc, s) => {
      acc[s.action] += 1;
      return acc;
    },
    { [ACTION_UPDATED]: 0, [ACTION_CREATED]: 0, [ACTION_DELETED]: 0, [ACTION_NO_CHANGE]: 0 }
  );
  logger.log();
  logger.log(
    `Syncs ${ACTION_CREATED}: ${counts[ACTION_CREATED]}, ${ACTION_UPDATED}: ${counts[ACTION_UPDATED]}, ${ACTION_DELETED}: ${counts[ACTION_DELETED]}, ${ACTION_NO_CHANGE}: ${counts[ACTION_NO_CHANGE]}`
  );
};

const handlerForFile = async (
  args: ArgumentsCamelCase<ApplyHandlerArgs>,
  fileJson: { syncConfigs: { name: string }[]; salesforceCredentials: Record<string, string> }
) => {
  let syncConfigs, salesforceCredentials;
  try {
    const res = await axiosInstance.get(`${args.url}/developer_config`, {
      timeout: 2000,
    });
    ({ syncConfigs, salesforceCredentials } = res.data);
  } catch (e) {
    // ignore if 404
    if ((e instanceof AxiosError && e.response?.status !== 404) || !(e instanceof AxiosError)) {
      throw e;
    }
  }

  logger.info(`Read salesforce credentials`);

  logger.log(`\n==================== Salesforce Credentials ====================`);
  const jsonDiff = diff.diffJson(salesforceCredentials ?? {}, fileJson.salesforceCredentials);
  const hasChanges = jsonDiff.some((part: any) => part.added || part.removed);
  if (hasChanges) {
    logger.info(`Updating salesforce credentials`);
  } else {
    logger.success(`No change to salesforce credentials`);
  }
  if (args.diff) {
    logDifference(jsonDiff);
  }

  logger.log();

  logger.info(`Read ${fileJson.syncConfigs.length} sync configs`);
  logger.info('Uploading sync configs');

  const commonOutput = { status: 'Live' };

  let isUpdate = false;
  const statuses = [];
  for (const newConfig of fileJson.syncConfigs) {
    logger.log(`\n==================== Sync: ${newConfig.name} ====================`);
    const oldConfig = syncConfigs?.find((c: any) => c.name === newConfig.name);
    if (oldConfig) {
      isUpdate = true;
      const jsonDiff = diff.diffJson(oldConfig, newConfig);
      const hasChanges = jsonDiff.some((part: any) => part.added || part.removed);
      if (hasChanges) {
        logger.info(`Updating sync config "${newConfig.name}"`);
      } else {
        logger.success(`No change to sync config "${newConfig.name}"`);
      }
      statuses.push({
        ...commonOutput,
        action: hasChanges ? ACTION_UPDATED : ACTION_NO_CHANGE,
        name: newConfig.name,
        type: 'syncConfig',
      });
      if (args.diff) {
        logDifference(jsonDiff);
      }
      if (hasChanges) {
        logger.success(`Updated sync config "${newConfig.name}"`);
      }
    } else {
      logger.info(`Creating sync config "${newConfig.name}"`);
      statuses.push({ ...commonOutput, action: ACTION_CREATED, name: newConfig.name, type: 'syncConfig' });
      const jsonDiff = diff.diffJson({}, newConfig);
      if (args.diff) {
        logDifference(jsonDiff);
      }
      logger.success(`Created sync config "${newConfig.name}"`);
    }
  }

  // create status for deleted configs
  if (syncConfigs) {
    for (const oldConfig of syncConfigs) {
      const newConfig = fileJson.syncConfigs.find((c: any) => c.name === oldConfig.name);
      if (!newConfig) {
        logger.log(`\n==================== Sync: ${oldConfig.name} ====================`);
        logger.info(`Deleting sync config "${oldConfig.name}"`);
        const jsonDiff = diff.diffJson(oldConfig, {});
        if (args.diff) {
          logDifference(jsonDiff);
        }
        statuses.push({
          ...commonOutput,
          action: ACTION_DELETED,
          name: oldConfig.name,
          type: 'syncConfig',
        });
        logger.success(`Deleted sync config "${oldConfig.name}"`);
      }
    }
  }

  if (isUpdate) {
    await axiosInstance.put(`${args.url}/developer_config`, fileJson);
  } else {
    await axiosInstance.post(`${args.url}/developer_config`, fileJson);
  }

  return statuses;
};

function logDifference(jsonDiff: diff.Change[]) {
  // only print if there are differences
  if (jsonDiff.some((part: any) => part.added || part.removed)) {
    logger.info('The following changes will be applied:');

    jsonDiff.forEach((part: any) => {
      // green for additions, red for deletions
      // grey for common parts
      let color: keyof typeof chalk;
      let prefix = '';
      if (part.added) {
        color = 'green';
        prefix = '+';
      } else if (part.removed) {
        color = 'red';
        prefix = '-';
      } else {
        color = 'grey';
      }

      const applyColor = chalk[color];

      part.value.split('\n').forEach((line: string) => {
        process.stderr.write(applyColor(`${prefix}${line}\n`));
      });
    });
    return true;
  } else {
    return false;
  }
}
