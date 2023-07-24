import type {
  Application,
  Customer,
  DestinationCreateParamsAny,
  DestinationSafeAny,
  DestinationTestParamsAny,
  DestinationTestResult,
  DestinationUpdateParamsAny,
  Provider,
  ProviderCreateParams,
  Schema,
  SyncConfig,
  WebhookConfig,
} from '@supaglue/types';
import type { Entity } from '@supaglue/types/entity';
import type { EntityMapping } from '@supaglue/types/entity_mapping';
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

export type ClientSuccessEmptyResponse = {
  ok: true;
  status: number;
};

export type ClientEmptyResponse = ClientErrorResponse | ClientSuccessEmptyResponse;

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

// We need this because for 204s, response.json() will throw an error.
async function toClientEmptyResponse(response: Response): Promise<ClientEmptyResponse> {
  const { ok, status } = response;
  if (!ok) {
    const data = await response.json();
    return {
      ok,
      status,
      errorMessage: getErrorMessage(data) ?? 'Encountered an error.',
    };
  }
  return { ok: true, status };
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

export async function deleteWebhook(applicationId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/webhook/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });

  return await toClientEmptyResponse(result);
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

export async function deleteProvider(applicationId: string, providerId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/providers/${providerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function createSyncConfig(
  applicationId: string,
  data: Omit<SyncConfig, 'id'>
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

export async function deleteSyncConfig(applicationId: string, syncConfigId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/sync-configs/${syncConfigId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function createSchema(applicationId: string, data: Omit<Schema, 'id'>): Promise<ClientResponse<Schema>> {
  const result = await fetch(`/api/internal/schemas/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function updateSchema(applicationId: string, data: Schema): Promise<ClientResponse<Schema>> {
  const result = await fetch(`/api/internal/schemas/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function deleteSchema(applicationId: string, syncConfigId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/schemas/${syncConfigId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function createEntity(applicationId: string, data: Omit<Entity, 'id'>): Promise<ClientResponse<Entity>> {
  const result = await fetch(`/api/internal/entities/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function updateEntity(applicationId: string, data: Entity): Promise<ClientResponse<Entity>> {
  const result = await fetch(`/api/internal/entities/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  return await toClientResponse(result);
}

export async function deleteEntity(applicationId: string, syncConfigId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/entities/${syncConfigId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function updateEntityMapping(
  applicationId: string,
  customerId: string,
  providerName: string,
  data: EntityMapping
): Promise<ClientEmptyResponse> {
  const result = await fetch(
    `/api/internal/entity-mappings/${data.entityId}?customer_id=${customerId}&provider_name=${providerName}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-application-id': applicationId,
      },
      body: JSON.stringify(snakecaseKeys(data)),
    }
  );
  return await toClientEmptyResponse(result);
}

export async function createDestination(data: DestinationCreateParamsAny): Promise<ClientResponse<DestinationSafeAny>> {
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

export async function testDestination(data: DestinationTestParamsAny): Promise<ClientResponse<DestinationTestResult>> {
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

export async function updateDestination(data: DestinationUpdateParamsAny): Promise<ClientResponse<DestinationSafeAny>> {
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

export async function deleteApplication(id: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/applications/${id}`, {
    method: 'DELETE',
  });
  return await toClientEmptyResponse(result);
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

export async function deleteCustomer(applicationId: string, customerId: string): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/customers/${encodeURIComponent(customerId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function deleteConnection(
  applicationId: string,
  customerId: string,
  connectionId: string
): Promise<ClientEmptyResponse> {
  const result = await fetch(`/api/internal/customers/${encodeURIComponent(customerId)}/connections/${connectionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
    },
  });
  return await toClientEmptyResponse(result);
}

export async function pauseSync(
  args: {
    applicationId: string;
    customerId: string;
    providerName: string;
  } & (
    | {
        objectType: string;
        object: string;
      }
    | {
        entityId: string;
      }
  )
): Promise<ClientEmptyResponse> {
  const { applicationId, customerId, providerName } = args;
  const result = await fetch(`/api/internal/syncs/_pause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
      'x-customer-id': customerId,
      'x-provider-name': providerName,
    },
    body: JSON.stringify({
      object_type: 'objectType' in args ? args.objectType : undefined,
      object: 'object' in args ? args.object : undefined,
      entity_id: 'entityId' in args ? args.entityId : undefined,
    }),
  });
  return await toClientEmptyResponse(result);
}

export async function resumeSync(
  args: {
    applicationId: string;
    customerId: string;
    providerName: string;
  } & (
    | {
        objectType: string;
        object: string;
      }
    | {
        entityId: string;
      }
  )
): Promise<ClientEmptyResponse> {
  const { applicationId, customerId, providerName } = args;
  const result = await fetch(`/api/internal/syncs/_resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
      'x-customer-id': customerId,
      'x-provider-name': providerName,
    },
    body: JSON.stringify({
      object_type: 'objectType' in args ? args.objectType : undefined,
      object: 'object' in args ? args.object : undefined,
      entity_id: 'entityId' in args ? args.entityId : undefined,
    }),
  });
  return await toClientEmptyResponse(result);
}

export async function triggerSync(
  args: {
    applicationId: string;
    customerId: string;
    providerName: string;
    performFullRefresh?: boolean;
  } & (
    | {
        objectType: string;
        object: string;
      }
    | {
        entityId: string;
      }
  )
): Promise<ClientEmptyResponse> {
  const { applicationId, customerId, providerName, performFullRefresh } = args;
  const result = await fetch(`/api/internal/syncs/_trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': applicationId,
      'x-customer-id': customerId,
      'x-provider-name': providerName,
    },
    body: JSON.stringify({
      object_type: 'objectType' in args ? args.objectType : undefined,
      object: 'object' in args ? args.object : undefined,
      entity_id: 'entityId' in args ? args.entityId : undefined,
      perform_full_refresh: performFullRefresh,
    }),
  });
  return await toClientEmptyResponse(result);
}
