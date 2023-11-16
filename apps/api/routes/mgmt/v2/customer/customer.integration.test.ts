/**
 * Tests customer endpoints
 *
 * @group integration/mgmt/v2/customers
 * @jest-environment ./integration-test-environment
 */

import type { UpsertCustomerRequest, UpsertCustomerSuccessfulResponse } from '@supaglue/schemas/v2/mgmt';

describe('customer', () => {
  it('upsert creates a new customer', async () => {
    const request: UpsertCustomerRequest = {
      customer_id: Math.random().toString(),
      name: 'Test Customer',
      email: '',
    };
    const response = await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', request);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      application_id: expect.any(String),
      customer_id: request.customer_id,
      name: request.name,
      email: request.email,
    });
  });

  it('upsert updates an existing customer', async () => {
    const request: UpsertCustomerRequest = {
      customer_id: Math.random().toString(),
      name: 'Test Customer',
      email: '',
    };
    await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', request);

    const updatedRequest: UpsertCustomerRequest = {
      customer_id: request.customer_id,
      name: 'Updated Test Customer',
      email: `customer${Math.random()}@supaglue.com`,
    };

    const response = await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', updatedRequest);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      application_id: expect.any(String),
      customer_id: updatedRequest.customer_id,
      name: updatedRequest.name,
      email: updatedRequest.email,
    });
  });

  it('get returns an existing customer', async () => {
    const request: UpsertCustomerRequest = {
      customer_id: Math.random().toString(),
      name: 'Test Customer',
      email: '',
    };
    await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', request);

    const response = await apiClient.get<UpsertCustomerSuccessfulResponse>(`/mgmt/v2/customers/${request.customer_id}`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      application_id: expect.any(String),
      customer_id: request.customer_id,
      name: request.name,
      email: request.email,
    });
  });

  it('get returns a 404 for a non-existing customer', async () => {
    const response = await apiClient.get<UpsertCustomerSuccessfulResponse>(`/mgmt/v2/customers/nonexistentcustomer`);
    expect(response.status).toBe(404);
  });

  it('list returns an array of customers', async () => {
    const request: UpsertCustomerRequest = {
      customer_id: Math.random().toString(),
      name: 'Test Customer',
      email: '',
    };
    await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', request);

    const response = await apiClient.get<UpsertCustomerSuccessfulResponse[]>(`/mgmt/v2/customers`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.arrayContaining([
        {
          application_id: expect.any(String),
          customer_id: request.customer_id,
          name: request.name,
          email: request.email,
        },
      ])
    );
  });

  it('can delete a customer', async () => {
    const request: UpsertCustomerRequest = {
      customer_id: Math.random().toString(),
      name: 'Test Customer',
      email: '',
    };
    await apiClient.put<UpsertCustomerSuccessfulResponse>('/mgmt/v2/customers', request);

    const response = await apiClient.delete(`/mgmt/v2/customers/${request.customer_id}`);
    expect(response.status).toBe(204);

    const getResponse = await apiClient.get<UpsertCustomerSuccessfulResponse>(
      `/mgmt/v2/customers/${request.customer_id}`
    );
    expect(getResponse.status).toBe(404);
  });
});
