export const API_HOST = 'http://localhost:8080';

export const fetcher = (input: RequestInfo, init: RequestInit) => {
  const supaglueHeaders = new Headers();

  // For /crm endpoints, add customer-id and provider-name headers
  if (input.toString().startsWith(`${API_HOST}/crm`)) {
    supaglueHeaders.append(
      'customer-id',
      '9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677' // TODO: get this from the user's session
    );
    supaglueHeaders.append('provider-name', 'salesforce'); // TODO: get this from the user's session
  }

  return fetch(input, { headers: supaglueHeaders, ...init }).then((res) => res.json());
};
