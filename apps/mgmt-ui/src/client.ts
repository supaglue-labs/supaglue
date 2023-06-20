import type {
  Application,
  Customer,
  Destination,
  DestinationCreateParams,
  DestinationTestParams,
  DestinationTestResult,
  DestinationUpdateParams,
  Integration,
  IntegrationCreateParams,
  Provider,
  ProviderCreateParams,
  SyncConfig,
  SyncConfigCreateParams,
  WebhookConfig,
} from '@supaglue/types';
import { snakecaseKeys, snakecaseKeysSansHeaders } from '@supaglue/utils/snakecase';

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
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
}

// TODO: Delete
export async function createRemoteIntegration(
  applicationId: string,
  data: IntegrationCreateParams
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

export async function createRemoteProvider(applicationId: string, data: ProviderCreateParams): Promise<Provider> {
  const result = await fetch(`/api/internal/providers/create`, {
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

export async function updateRemoteProvider(applicationId: string, data: Provider): Promise<Provider> {
  const result = await fetch(`/api/internal/providers/update`, {
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

export async function createSyncConfig(applicationId: string, data: SyncConfigCreateParams): Promise<SyncConfig> {
  const result = await fetch(`/api/internal/sync-configs/create`, {
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

export async function updateSyncConfig(applicationId: string, data: SyncConfig): Promise<SyncConfig> {
  const result = await fetch(`/api/internal/sync-configs/update`, {
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

export async function createDestination(data: DestinationCreateParams): Promise<Destination> {
  const result = await fetch(`/api/internal/destinations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

export async function testDestination(data: DestinationTestParams): Promise<DestinationTestResult> {
  const result = await fetch(`/api/internal/destinations/_test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

export async function updateDestination(data: DestinationUpdateParams): Promise<Destination> {
  const result = await fetch(`/api/internal/destinations/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

export async function addApplication(name: string): Promise<Application> {
  const result = await fetch(`/api/internal/applications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const r = await result.json();
  return r;
}

export async function updateApplicationName(id: string, name: string): Promise<Application> {
  const result = await fetch(`/api/internal/applications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const r = await result.json();
  return r;
}

export async function deleteApplication(id: string): Promise<void> {
  await fetch(`/api/internal/applications/${id}`, {
    method: 'DELETE',
  });
}

export async function createCustomer(
  applicationId: string,
  customerId: string,
  name: string,
  email: string
): Promise<Customer> {
  const result = await fetch(`/api/internal/customers/create`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify({ customerId, name, email }),
  });

  const r = await result.json();
  return r;
}

export async function deleteCustomer(applicationId: string, customerId: string): Promise<void> {
  await fetch(`/api/internal/customers/${customerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
}

export async function deleteConnection(applicationId: string, customerId: string, connectionId: string): Promise<void> {
  await fetch(`/api/internal/customers/${customerId}/connections/${connectionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
}
