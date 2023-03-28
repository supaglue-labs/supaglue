import { snakecaseKeys, snakecaseKeysSansHeaders } from '@supaglue/core/lib/snakecase';
import { Application, CRMIntegrationCreateParams, Integration, WebhookConfig } from '@supaglue/core/types';

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

export async function createOrUpdateWebhook(applicationId: string, data: WebhookConfig): Promise<WebhookConfig> {
  const result = await fetch(`/api/internal/webhook/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeysSansHeaders(data)),
  });

  const r = await result.json();
  return r;
}

export async function deleteWebhook(applicationId: string): Promise<void> {
  await fetch(`/api/internal/webhook/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
}

export async function createRemoteIntegration(
  applicationId: string,
  data: CRMIntegrationCreateParams
): Promise<Integration> {
  const result = await fetch(`/api/internal/integrations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
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

export async function addApplication(name: string): Promise<Application> {
  const result = await fetch(`/api/internal/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const r = await result.json();
  return r;
}

// TODO: add other calls
