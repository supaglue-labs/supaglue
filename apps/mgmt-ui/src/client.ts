import { snakecaseKeys } from './utils/snakecase';

// TODO: data drive these headers based on the active application context
export const API_HOST = 'http://localhost:8080';
export const APPLICATION_ID = 'a4398523-03a2-42dd-9681-c91e3e2efaf4';
export const SG_INTERNAL_TOKEN = process.env.NEXT_PUBLIC_SUPAGLUE_INTERNAL_TOKEN!;
export const CUSTOMER_ID = '9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677';
export const PROVIDER_NAME = 'salesforce';

// TODO: use Supaglue TS client
export async function updateRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/internal/v1/integrations/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': APPLICATION_ID,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

// TODO: use Supaglue TS client
export async function createRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/internal/v1/integrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': APPLICATION_ID,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
    body: JSON.stringify(snakecaseKeys(data)),
  });

  const r = await result.json();
  return r;
}

// TODO: use Supaglue TS client
export async function removeRemoteIntegration(data: any) {
  const result = await fetch(`${API_HOST}/internal/v1/integrations/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': APPLICATION_ID,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
  });

  const r = await result.json();
  return r;
}

// TODO: add other calls
