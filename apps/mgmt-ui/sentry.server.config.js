// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = !(
  process.env.SUPAGLUE_DISABLE_ERROR_REPORTING ||
  process.env.NEXT_PUBLIC_SUPAGLUE_DISABLE_ERROR_REPORTING ||
  process.env.CI
);

Sentry.init({
  dsn: SENTRY_DSN || 'https://c9b7660599b7410e972b290a1e62dd5f@o4504573112745984.ingest.sentry.io/4504878650753024',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  enabled: SENTRY_ENABLED,
});
