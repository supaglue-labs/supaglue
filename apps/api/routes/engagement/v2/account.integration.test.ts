/**
 * Tests accounts endpoints
 *
 * @group integration/engagement/v2/accounts
 * @jest-environment ./integration-test-environment
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
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });

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

      // test that the db was updated
      const dbAccount = await db.query('SELECT * FROM engagement_accounts WHERE id = $1', [response.data.record?.id]);
      expect(dbAccount.rows[0].name).toEqual(testAccount.name);
      expect(dbAccount.rows[0].domain).toEqual(testAccount.domain);
    }, 120000);

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
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });

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
      expect(getResponse.data.domain).toEqual(testAccount.domain);

      // test that the db was updated
      const dbAccount = await db.query('SELECT * FROM engagement_accounts WHERE id = $1', [response.data.record?.id]);
      expect(dbAccount.rows[0].name).toEqual('updated account');
      expect(dbAccount.rows[0].domain).toEqual(testAccount.domain);
    }, 120000);
  });
});
