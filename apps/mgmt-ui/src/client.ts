import { snakecaseKeys } from './utils/snakecase';

// TODO: use Supaglue TS client

export async function createRemoteApiKey(applicationId: string) {
  const result = await fetch(`/api/internal/api_keys/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });

  const r = await result.json();
  return r;
}

export async function deleteRemoteApiKey(applicationId: string) {
  const result = await fetch(`/api/internal/api_keys/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });

  const r = await result.json();
  return r;
}

export async function updateRemoteIntegration(applicationId: string, data: any) {
  const result = await fetch(`/api/internal/integrations/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

// TODO: add other calls
