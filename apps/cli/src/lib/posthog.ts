import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import yargsParser from 'yargs-parser';
import { isCurrentBinInstalledGlobally } from './utils';

const ANALYTICS_ENABLED = !(process.env.SUPAGLUE_DISABLE_ANALYTICS || process.env.CI || process.env.DEV_CLI);

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
const installType = isCurrentBinInstalledGlobally() ? 'global' : 'local';

const configPath = path.join(os.homedir(), '.supaglue', 'session.json');
let distinctIdentifier: string | undefined = undefined;

if (ANALYTICS_ENABLED) {
  // read distinctId from config file or write it if it doesnt exist
  if (fs.existsSync(configPath)) {
    const session = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!session.distinctIdentifier) {
      session.distinctIdentifier = uuidv4();
      fs.writeFileSync(configPath, JSON.stringify(session), 'utf8');
    }

    ({ distinctIdentifier } = session);
  } else {
    distinctIdentifier = uuidv4();
    fs.mkdirSync(path.join(os.homedir(), '.supaglue'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ distinctIdentifier }));
  }
}

export const distinctId = distinctIdentifier && `session:${distinctIdentifier}`;

let client: PostHog;

async function getPosthogApiKeyFromServer(apiUrl: string): Promise<string | undefined> {
  // get posthog api key from the server
  try {
    const response = await axios(`${apiUrl}/cli_config`, { timeout: 200 });
    const { posthogApiKey } = response.data;
    return posthogApiKey;
  } catch (e) {
    // ignore
  }
}

export async function getClient(apiUrl: string) {
  if (client) {
    return client;
  }

  if (!ANALYTICS_ENABLED) {
    client = new PostHog('dummy', { enable: false });
    return client;
  }

  // get posthog api key from the session.json file
  let posthogApiKey: string | undefined;
  if (fs.existsSync(configPath)) {
    const session = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!session.posthogApiKey) {
      session.posthogApiKey = await getPosthogApiKeyFromServer(apiUrl);
      fs.writeFileSync(configPath, JSON.stringify(session), 'utf8');
    }

    ({ posthogApiKey } = session);
  } else {
    posthogApiKey = await getPosthogApiKeyFromServer(apiUrl);
    fs.mkdirSync(path.join(os.homedir(), '.supaglue'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ posthogApiKey }));
  }

  client = new PostHog(posthogApiKey || 'dummy', {
    enable: Boolean(ANALYTICS_ENABLED && posthogApiKey),
    requestTimeout: 500,
  });

  return client;
}

export function logCommandAnalytics(client: PostHog, args: yargsParser.Arguments, error?: Error) {
  const command = args._[0] === 'apply' ? 'apply' : args._.join(' ');
  client.capture({
    distinctId: distinctId ?? '',
    event: `Command: ${command}`,
    properties: {
      command,
      args,
      result: error ? 'error' : 'success',
      error: error?.toString(),
      source: 'cli',
      system: {
        version,
        arch: process.arch,
        os: process.platform,
        nodeVersion: process.version,
        installType,
      },
    },
  });
}
