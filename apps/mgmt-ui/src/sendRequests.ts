import { API_HOST } from './hooks';

// TODO: Read more into best SWR practices
export async function sendRequest(url: string, { arg }: { arg: any }) {
  if (arg.id === undefined) {
    return fetch(`${API_HOST}${url}`, {
      method: 'POST',
      body: JSON.stringify(arg),
    });
  }

  return fetch(`${API_HOST}${url}/${arg.id}`, {
    method: 'PUT',
    body: JSON.stringify(arg),
  });
}
