import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import yargsParser from 'yargs-parser';
import { hideBin } from 'yargs/helpers';
import { UserFacingError } from './errors';
import * as logger from './lib/logger';
import { getClient, logCommandAnalytics } from './lib/posthog';
import { printUpdateMessage } from './lib/utils';

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const sentryEnabled = !(process.env.SUPAGLUE_DISABLE_ERROR_REPORTING || process.env.CI);
if (sentryEnabled) {
  Sentry.init({
    // this is the public DSN for the project in sentry, so it's safe and expected to be committed, per Sentry's CTO:
    // https://github.com/getsentry/sentry-docs/pull/1723#issuecomment-781041906
    dsn: 'https://81aaa80895c44389ad5da8fb007a298e@o4504573112745984.ingest.sentry.io/4504573687037952',
    integrations: [
      new RewriteFrames({
        root: __dirname,
      }),
      new Sentry.Integrations.OnUnhandledRejection({ mode: process.env.DEBUG ? 'warn' : 'none' }),
    ],
    release: version,
    beforeSend(event, hint) {
      // don't log UserFacingErrors to sentry
      if (hint.originalException instanceof UserFacingError) {
        return null;
      }
      return event;
    },
  });
}

const argv = yargsParser(hideBin(process.argv));
const DEFAULT_API_URL = 'http://localhost:8080';

export type BaseArgs = {
  url: string;
};

void (async () => {
  const posthogClient = await getClient(argv.url || DEFAULT_API_URL);

  await yargs
    .scriptName('supaglue')
    .usage('$0 <cmd> [args]')
    .recommendCommands()
    .middleware(async (yargs) => {
      Sentry.setContext('argv', argv);
      Sentry.setContext('args', yargs);
    })
    .option('url', {
      describe: 'URL for the API server',
      default: DEFAULT_API_URL,
    })
    // these are here for documentation purposes only - chalk actually handles it
    .option('color', {
      description: 'Enable color output',
      type: 'boolean',
      default: true,
      hidden: true,
    })
    .option('no-color', {
      describe: 'Disable color output',
      type: 'boolean',
    })
    .commandDir('commands', { extensions: process.env.DEV_CLI ? ['ts'] : ['js'] })
    .demandCommand(1, 'You must specify a command')
    .fail(async (msg, err, yargs) => {
      if (err) {
        logCommandAnalytics(posthogClient, argv, err);

        if (err instanceof UserFacingError) {
          yargs.showHelp();
          logger.log();
          logger.error(err.message);
          if (err.errors.length) {
            // iterate over errors and log them
            err.errors.forEach((e) => {
              logger.log(e);
            });
          }
        } else {
          logger.log();
          logger.error('An unexpected error occurred. Please try again later.');
          logger.error(err.message);
          const errorId = Sentry.captureException(err);
          if (sentryEnabled) {
            logger.error(`When contacting support, reference error ID: ${errorId}`);
          }
        }
      } else {
        logCommandAnalytics(posthogClient, argv, new Error(msg));

        yargs.showHelp();
        logger.log();
        logger.error(msg);
      }
      await Sentry.flush(2000);
      await posthogClient.shutdownAsync();
    })
    .config()
    .default('config', '~/.supaglue/config.json')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help').argv;

  const shouldHide = process.env.SUPAGLUE_HIDE_UPDATE_MESSAGE;
  if (!shouldHide) {
    await printUpdateMessage();
  }

  logCommandAnalytics(posthogClient, argv);
  await posthogClient.shutdownAsync();
})();

if (!process.env.DEBUG) {
  process.on('uncaughtException', (err) => {
    // swallow uncaught exceptions - they should be reported by the sentry anyway
  });
}
