/**
 * Tests connection endpoints
 *
 * @group integration/mgmt/v2/customers/connections
 * @jest-environment ./integration-test-environment
 */

import type { GetConnectionResponse, GetConnectionsResponse } from '@supaglue/schemas/v2/mgmt';

describe('connection', () => {
  test(`LIST (200) then GET (200)`, async () => {
    const CUSTOMER_ID = 'customer1';
    const connectionsResponse = await apiClient.get<GetConnectionsResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(200);

    const providerName = connectionsResponse.data[0].provider_name;
    const connectionResponse = await apiClient.get<GetConnectionResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${providerName}`
    );
    expect(connectionResponse.status).toEqual(200);
  });

  test(`LIST (404)`, async () => {
    const CUSTOMER_ID = 'nonexistentcustomer';
    const connectionsResponse = await apiClient.get<GetConnectionsResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(404);
  });

  test(`GET bad provider name (400)`, async () => {
    const CUSTOMER_ID = 'customer1';
    const providerName = 'nonexistingprovider';
    const connectionResponse = await apiClient.get<GetConnectionResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${providerName}`
    );
    expect(connectionResponse.status).toEqual(400);
  });
});
