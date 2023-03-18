import { Integration } from '@supaglue/core/types';
import { snakecaseKeys } from './utils/snakecase';

// TODO: use Supaglue TS client

export async function createRemoteApiKey(applicationId: string): Promise<{ api_key: string }> {
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

export async function deleteRemoteApiKey(applicationId: string): Promise<{ api_key: null }> {
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

export async function updateRemoteIntegration(applicationId: string, data: Integration): Promise<Integration> {
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
