export type Customer = {
  id: string;
  applicationId: string;
  createdAt: Date;
  updatedAt: Date;

  // TODO: add fields
};
export type BaseCustomer = Customer & {
  // TODO: add fields
};
export type BaseCustomerCreateParams = Omit<Omit<Omit<BaseCustomer, 'id'>, 'createdAt'>, 'updatedAt'>;
export type CustomerCreateParams = BaseCustomerCreateParams;
export type CustomerUpdateParams = BaseCustomerCreateParams;
