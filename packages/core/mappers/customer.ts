import type { Customer as CustomerModel } from '@supaglue/db';
import { Customer, CustomerExpandedSafe, CustomerUpsertParams } from '@supaglue/types';
import { CustomerModelExpanded } from '../types/customer';
import { fromConnectionModelToConnectionSafe } from './connection';

export const fromCustomerModel = ({ id, applicationId, externalIdentifier, name, email }: CustomerModel): Customer => {
  return {
    applicationId,
    customerId: externalIdentifier,
    name,
    email,
  };
};

export const toCustomerModelCreateParams = ({
  applicationId,
  customerId,
  name,
  email,
}: CustomerUpsertParams): Omit<CustomerModel, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    applicationId,
    externalIdentifier: customerId,
    name,
    email,
  };
};

export const fromCustomerModelExpandedUnsafe = ({
  applicationId,
  externalIdentifier,
  name,
  email,
  connections,
}: CustomerModelExpanded): CustomerExpandedSafe => {
  return {
    applicationId,
    customerId: externalIdentifier,
    name,
    email,
    connections: connections ? connections.map((connection) => fromConnectionModelToConnectionSafe(connection)) : [],
  };
};
