import type {
  Application,
  Customer,
  Destination,
  DestinationCreateParams,
  DestinationTestParams,
  DestinationTestResult,
  DestinationUpdateParams,
  Provider,
  ProviderCreateParams,
  SyncConfig,
  SyncConfigCreateParams,
  WebhookConfig,
} from '@supaglue/types';
import { snakecaseKeys, snakecaseKeysSansHeaders } from '@supaglue/utils/snakecase';

export type ClientErrorResponse = {
  ok: false;
  status: number;
  errorMessage: string;
};

export type ClientSuccessResponse<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ClientResponse<T> = ClientErrorResponse | ClientSuccessResponse<T>;

async function toClientResponse<T>(response: Response): Promise<ClientResponse<T>> {
  const { ok, status } = response;
  const data = await response.json();
  if (!ok) {
    return {
      ok,
      status,
      errorMessage: getErrorMessage(data) ?? 'Encountered an error.',
    };
  }
  return { ok: true, status, data };
}

function getErrorMessage(data: any): string {
  return data.errors?.map((error: any) => error.title).join('\n');
}

export async function createRemoteApiKey(applicationId: string): Promise<ClientResponse<{ api_key: string }>> {
  const result = await fetch(`/api/internal/api_keys/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });

  return await toClientResponse(result);
}

export async function createOrUpdateWebhook(
  applicationId: string,
  data: WebhookConfig
): Promise<ClientResponse<WebhookConfig>> {
  const result = await fetch(`/api/internal/webhook/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeysSansHeaders(data)),
  });

  return await toClientResponse(result);
}

export async function deleteWebhook(applicationId: string): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/webhook/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });

  return await toClientResponse(result);
}

export async function createRemoteProvider(
  applicationId: string,
  data: ProviderCreateParams
): Promise<ClientResponse<Provider>> {
  const result = await fetch(`/api/internal/providers/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function updateRemoteProvider(applicationId: string, data: Provider): Promise<ClientResponse<Provider>> {
  const result = await fetch(`/api/internal/providers/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function deleteProvider(applicationId: string, providerId: string): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/providers/${providerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientResponse(result);
}

export async function createSyncConfig(
  applicationId: string,
  data: SyncConfigCreateParams
): Promise<ClientResponse<SyncConfig>> {
  const result = await fetch(`/api/internal/sync-configs/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function updateSyncConfig(applicationId: string, data: SyncConfig): Promise<ClientResponse<SyncConfig>> {
  const result = await fetch(`/api/internal/sync-configs/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function deleteSyncConfig(applicationId: string, syncConfigId: string): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/sync-configs/${syncConfigId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientResponse(result);
}

export async function createDestination(data: DestinationCreateParams): Promise<ClientResponse<Destination>> {
  const result = await fetch(`/api/internal/destinations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function testDestination(data: DestinationTestParams): Promise<ClientResponse<DestinationTestResult>> {
  const result = await fetch(`/api/internal/destinations/_test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function updateDestination(data: DestinationUpdateParams): Promise<ClientResponse<Destination>> {
  const result = await fetch(`/api/internal/destinations/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': data.applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function addApplication(name: string): Promise<ClientResponse<Application>> {
  const result = await fetch(`/api/internal/applications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return await toClientResponse(result);
}

export async function updateApplicationName(id: string, name: string): Promise<ClientResponse<Application>> {
  const result = await fetch(`/api/internal/applications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return await toClientResponse(result);
}

export async function deleteApplication(id: string): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/applications/${id}`, {
    method: 'DELETE',
  });
  return await toClientResponse(result);
}

export async function createCustomer(
  applicationId: string,
  customerId: string,
  name: string,
  email: string
): Promise<ClientResponse<Customer>> {
  const result = await fetch(`/api/internal/customers/create`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify({ customerId, name, email }),
  });

  return await toClientResponse(result);
}

export async function deleteCustomer(applicationId: string, customerId: string): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/customers/${customerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientResponse(result);
}

export async function deleteConnection(
  applicationId: string,
  customerId: string,
  connectionId: string
): Promise<ClientResponse<void>> {
  const result = await fetch(`/api/internal/customers/${customerId}/connections/${connectionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientResponse(result);
}
