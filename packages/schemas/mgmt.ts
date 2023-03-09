import type { operations, paths } from './gen/mgmt';

export type GetCustomersPathParams = never;
export type GetCustomersQueryParams = never;
export type GetCustomersRequest = never;
export type GetCustomersResponse =
  operations['getCustomers']['responses'][keyof operations['getCustomers']['responses']]['content']['application/json'];

export type CreateCustomerPathParams = never;
export type CreateCustomerRequest = operations['createCustomer']['requestBody']['content']['application/json'];
export type CreateCustomerResponse =
  operations['createCustomer']['responses'][keyof operations['createCustomer']['responses']]['content']['application/json'];

export type GetCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type GetCustomerRequest = never;
export type GetCustomerResponse =
  operations['getCustomer']['responses'][keyof operations['getCustomer']['responses']]['content']['application/json'];

export type DeleteCustomerPathParams = paths[`/customers/{customer_id}`]['parameters']['path'];
export type DeleteCustomerRequest = never;
export type DeleteCustomerResponse =
  operations['deleteCustomer']['responses'][keyof operations['deleteCustomer']['responses']]['content']['application/json'];
