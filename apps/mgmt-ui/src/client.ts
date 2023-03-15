import { snakecaseKeys } from './utils/snakecase';

// TODO: use Supaglue TS client
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
