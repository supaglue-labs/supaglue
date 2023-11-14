import type { Level, Logger } from 'pino';
import pino from 'pino';
// @ts-expect-error this package doesn't have types
import { addContext, wrapLogger } from 'pino-context';
import pretty from 'pino-pretty';
// @ts-expect-error this package doesn't have types
export { default as expressScopeMiddleware } from 'pino-context/integrations/express';

// add a type for this since pino-context doesn't have any
export const addLogContext: (key: string, value: unknown) => void = addContext;

const LOG_LEVEL = process.env.SUPAGLUE_LOG_LEVEL as Level;

const streams: (pino.DestinationStream | pino.StreamEntry)[] = [];
if (process.env.SUPAGLUE_PRETTY_LOGS) {
  streams.push(pretty({ translateTime: true, colorize: true }));
} else {
  streams.push({ stream: process.stdout });
}

// add a type for this since pino-context doesn't have any
export const logger: Logger = wrapLogger(
  pino(
    {
      level: LOG_LEVEL,
      base: undefined, // don't log hostname and pid,
      redact: [
        'err.config.headers.Authorization', // axios errors
      ],
    },
    pino.multistream(streams)
  )
);
