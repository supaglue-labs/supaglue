/**
 * Tests connection endpoints
 *
 * @group integration/mgmt/v2/customers/connections
 * @jest-environment ./integration-test-environment
 */

import type { GetConnectionsSuccessfulResponse, GetConnectionSuccessfulResponse } from '@supaglue/schemas/v2/mgmt';

describe('connection', () => {
  test(`LIST (200) then GET (200)`, async () => {
    const CUSTOMER_ID = 'customer1';
    const connectionsResponse = await apiClient.get<GetConnectionsSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(200);

    const providerName = connectionsResponse.data[0].provider_name;
    const connectionResponse = await apiClient.get<GetConnectionSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${providerName}`
    );
    expect(connectionResponse.status).toEqual(200);
  });

  test(`LIST (404)`, async () => {
    const CUSTOMER_ID = 'nonexistentcustomer';
    const connectionsResponse = await apiClient.get<GetConnectionsSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(404);
  });

  test(`GET bad provider name (400)`, async () => {
    const CUSTOMER_ID = 'customer1';
<<<<<<< HEAD
    const providerName = 'nonexistingprovider';
    const connectionResponse = await apiClient.get<GetConnectionResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${providerName}`
    );
    expect(connectionResponse.status).toEqual(400);
=======
    const connectionsResponse = await apiClient.get<GetConnectionsSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(200);

    const connectionId = 'nonexistentconnectionid';
    const connectionResponse = await apiClient.get<GetConnectionSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${connectionId}`
    );
    expect(connectionResponse.status).toEqual(404);
  });

  test(`Mismatched customer and connection: LIST (200) then GET (404)`, async () => {
    const CUSTOMER_ID = 'customer2';
    const connectionsResponse = await apiClient.get<GetConnectionsSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections`
    );
    expect(connectionsResponse.status).toEqual(200);

    const connectionId = 'nonexistentconnectionid';
    const connectionResponse = await apiClient.get<GetConnectionSuccessfulResponse>(
      `/mgmt/v2/customers/${CUSTOMER_ID}/connections/${connectionId}`
    );
    expect(connectionResponse.status).toEqual(404);
>>>>>>> ae7e4b05d (fix: type issues)
  });
});
