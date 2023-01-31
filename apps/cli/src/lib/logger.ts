/* eslint-disable no-console */

import chalk from 'chalk';

export function log(...args: any[]) {
  console.log(...args);
}

export function success(...args: any[]) {
  console.log(chalk.green('✔', 'Finished:', ...args));
}

export function error(...args: any[]) {
  console.error(chalk.red('✘', 'Error:', ...args));
}

export function warn(...args: any[]) {
  console.warn(chalk.yellow('⚠︎', 'Warning:', ...args));
}

export function info(...args: any[]) {
  console.info(chalk.blue('ℹ', 'Info:', ...args));
}

export function debug(...args: any[]) {
  if (process.env.DEBUG) {
    console.debug(chalk.magenta(...args));
  }
}
