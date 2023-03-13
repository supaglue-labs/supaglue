import fs from 'fs';
import path from 'path';
import { PostHog } from 'posthog-node';

const enable = Boolean(process.env.SUPAGLUE_DISABLE_ANALYTICS !== '1' && process.env.SUPAGLUE_POSTHOG_API_KEY);

export const posthogClient = new PostHog(process.env.SUPAGLUE_POSTHOG_API_KEY ?? 'dummy', {
  enable,
});

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

export function getSystemProperties() {
  return {
    version,
    arch: process.arch,
    os: process.platform,
    nodeVersion: process.version,
  };
}
