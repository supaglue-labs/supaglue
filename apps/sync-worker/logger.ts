import pino, { Level } from 'pino';
import pretty from 'pino-pretty';

const LOG_LEVEL = (process.env.SUPAGLUE_LOG_LEVEL ?? 'info') as Level;

const streams = [];
if (process.env.SUPAGLUE_PRETTY_LOGS) {
  streams.push(pretty({ ignore: 'pid,hostname', translateTime: true, singleLine: true, colorize: true }));
} else {
  streams.push({ stream: process.stdout });
}

export const logger = pino({}, pino.multistream(streams));
logger.level = LOG_LEVEL;
