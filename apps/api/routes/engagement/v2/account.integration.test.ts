/**
 * Tests accounts endpoints
 *
 * @group integration/engagement/v2/accounts
 */

import type {
  CreateAccountRequest,
  CreateAccountResponse,
  GetAccountResponse,
  UpdateAccountResponse,
} from '@supaglue/schemas/v2/engagement';

describe('account', () => {
  let testAccount: CreateAccountRequest['record'];

  beforeEach(() => {
    testAccount = {
      name: Math.random().toString(),
      domain: `test${Math.random().toString()}.com`,
    };
  });

  describe.each(['outreach', 'apollo', 'salesloft'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      // TODO get not supported for apollo
      if (providerName === 'apollo') {
        return;
      }
      const getResponse = await apiClient.get<GetAccountResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testAccount.name);
    }, 10000);

    test('PATCH /', async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      const updateResponse = await apiClient.patch<UpdateAccountResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          record: {
            name: 'updated account',
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(updateResponse.status).toEqual(200);

      // TODO get not supported for apollo
      if (providerName === 'apollo') {
        return;
      }
      const getResponse = await apiClient.get<GetAccountResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual('updated account');
    }, 10000);
  });
});
