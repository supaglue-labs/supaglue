import { snakecaseKeys } from './utils/snakecase';

export const API_HOST = 'http://localhost:8080';

// TODO: get this on the server-side from the session
export const APPLICATION_ID = 'a4398523-03a2-42dd-9681-c91e3e2efaf4';

// TODO: use Supaglue TS client
export async function updateRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/integrations/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

// TODO: use Supaglue TS client
export async function createRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/integrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

// TODO: use Supaglue TS client
export async function removeRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/integrations/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const r = await result.json();
  return r;
}

// TODO: add other calls
