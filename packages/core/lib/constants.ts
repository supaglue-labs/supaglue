export const POSTGRES_UPDATE_BATCH_SIZE = 1000;

// The below 3 are only used when self-hosted
export const ORGANIZATION_ID = 'e7070cc8-36e7-43e2-81fc-ad57713cf2d3';
export const SG_USER_ID = 'd56b851b-5a36-4480-bc43-515d677f46e3';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';

export const ASYNC_RETRY_OPTIONS = {
  // TODO: Don't make this 'forever', so that the activity will actually get heartbeats
  // and will know that this activity is making progress.
  forever: true,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 60 * 1000,
};
