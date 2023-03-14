import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const configPath = path.join(os.homedir(), '.supaglue', 'session.json');
let distinctIdentifier: string | undefined = undefined;

// read distinctId from config file or write it if it doesn't exist
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

export const distinctId = distinctIdentifier && `session:${distinctIdentifier}`;
