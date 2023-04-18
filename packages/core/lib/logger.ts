import pino, { Level } from 'pino';
import pretty from 'pino-pretty';
import { createWriteStream } from 'pino-sentry';

const sentryEnabled = !(process.env.SUPAGLUE_DISABLE_ERROR_REPORTING || process.env.CI);

const LOG_LEVEL = (process.env.SUPAGLUE_LOG_LEVEL ?? 'info') as Level;

const streams: (pino.DestinationStream | pino.StreamEntry)[] = [];
if (process.env.SUPAGLUE_PRETTY_LOGS) {
  streams.push(pretty({ ignore: 'pid,hostname', translateTime: true, singleLine: true, colorize: true }));
} else {
  streams.push({ stream: process.stdout });
}

if (sentryEnabled) {
  const sentryStream = createWriteStream({
    // this is the public DSN for the project in sentry, so it's safe and expected to be committed, per Sentry's CTO:
    // https://github.com/getsentry/sentry-docs/pull/1723#issuecomment-781041906
    dsn: 'https://606fd8535f1c409ea96805e46f3add57@o4504573112745984.ingest.sentry.io/4504573114777600',
    // Log everything warning or above.
    level: 'error',
  });

  streams.push(sentryStream);
}

export const logger = pino({}, pino.multistream(streams));
logger.level = LOG_LEVEL;
