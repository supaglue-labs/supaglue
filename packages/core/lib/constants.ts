export const POSTGRES_UPDATE_BATCH_SIZE = 1000;

// The below 3 are only used when self-hosted
export const ORGANIZATION_ID = 'e7070cc8-36e7-43e2-81fc-ad57713cf2d3';
export const SG_USER_ID = 'd56b851b-5a36-4480-bc43-515d677f46e3';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';

export const SCHEMAS_OR_ENTITIES_APPLICATION_IDS = [
  'aba75b64-19ca-47c6-bb48-196911d8a18b',
  '82ff8465-2a09-499b-94c1-6d386502d14a',
  '7a695ded-b46d-406b-bd19-6e571880be74',
  'adbb1d52-273a-447c-891f-d3e299e45ddc',
  '39a890de-8dc7-4bdb-9007-e9a856a6b2e0',
  '02572019-cc02-4aa2-a16a-986cff3bf8b4',
  'fa90be4e-5315-4e12-9e2c-72cce4c1b083',
  'd5d45112-d700-42fc-a5d0-cc7bf879f8fb',
  '39e3fe2a-2403-498b-b4be-316a3c3f1bfe',
  'aba75b64-19ca-47c6-bb48-196911d8a18b',
  '82ff8465-2a09-499b-94c1-6d386502d14a',
];

export const ASYNC_RETRY_OPTIONS = {
  // TODO: Don't make this 'forever', so that the activity will actually get heartbeats
  // and will know that this activity is making progress.
  forever: true,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 60 * 1000,
};

export const REFRESH_TOKEN_THRESHOLD_MS = 300000;
