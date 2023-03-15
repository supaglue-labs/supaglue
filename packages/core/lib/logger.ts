import * as Sentry from '@sentry/node';
import pino, { Level } from 'pino';
import build from 'pino-abstract-transport';
import pretty from 'pino-pretty';

const sentryEnabled = !(process.env.SUPAGLUE_DISABLE_ERROR_REPORTING || process.env.CI);

const LOG_LEVEL = (process.env.SUPAGLUE_LOG_LEVEL ?? 'info') as Level;

const streams: (pino.DestinationStream | pino.StreamEntry)[] = [];
if (process.env.SUPAGLUE_PRETTY_LOGS) {
  streams.push(pretty({ ignore: 'pid,hostname', translateTime: true, singleLine: true, colorize: true }));
} else {
  streams.push({ stream: process.stdout });
}

if (sentryEnabled) {
  const sentryStream = build(async (source) => {
    for await (const obj of source) {
      if (!obj) {
        return;
      }

      const { err, msg, level } = obj;

      // warning is 40, error is 50, fatal is 60
      if (level >= 40) {
        if (err) {
          const mappedErr = new Error(err.message);
          mappedErr.stack = err.stack;
          Sentry.captureException(mappedErr);
          return;
        }

        Sentry.captureMessage(msg);
      }
    }
  });

  streams.push(sentryStream);
}

export const logger = pino({}, pino.multistream(streams));
logger.level = LOG_LEVEL;
