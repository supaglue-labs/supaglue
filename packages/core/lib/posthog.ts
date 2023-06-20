import fs from 'fs';
import path from 'path';
import { PostHog } from 'posthog-node';

const enable = process.env.SUPAGLUE_DISABLE_ANALYTICS !== '1' && process.env.SUPAGLUE_POSTHOG_API_KEY !== undefined;

export const posthogClient = new PostHog(process.env.SUPAGLUE_POSTHOG_API_KEY!, {
  enable,
});

const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

export function getSystemProperties() {
  return {
    version,
    arch: process.arch,
    os: process.platform,
    nodeVersion: process.version,
  };
}
