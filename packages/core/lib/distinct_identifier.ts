import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const sgDeploymentId = process.env.SUPAGLUE_DEPLOYMENT_ID;
const configPath = path.join(os.homedir(), '.supaglue', 'session.json');
let distinctIdentifier: string | undefined = undefined;

function generateDistinctId() {
  // Note: use coordination by naming convention for distinct ids between different supaglue services in the same deployment. We can add a suffix to avoid collisions down the road
  return sgDeploymentId ? sgDeploymentId : uuidv4();
}

// read distinctId from config file or write it if it doesn't exist
if (fs.existsSync(configPath)) {
  const session = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (!session.distinctIdentifier) {
    session.distinctIdentifier = generateDistinctId();
    fs.writeFileSync(configPath, JSON.stringify(session), 'utf8');
  }

  ({ distinctIdentifier } = session);
} else {
  distinctIdentifier = generateDistinctId();
  fs.mkdirSync(path.join(os.homedir(), '.supaglue'), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ distinctIdentifier }));
}

// The distinctIdentifier "session" lives from the time a developer runs docker compose to the time that they delete `session.json` from their home directory on the filesystem. Locally, it persists across docker compose up/down/restart and updates.
export const distinctId = process.env.IS_CLOUD ? undefined : distinctIdentifier && `session:${distinctIdentifier}`;
