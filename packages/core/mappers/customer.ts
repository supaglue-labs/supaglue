import { Customer, CustomerModelExpanded } from '../types/customer';
import { fromConnectionModelToConnectionUnsafe } from './connection';

export const fromCustomerModel = (
  { id, applicationId, externalIdentifier, name, email, connections }: CustomerModelExpanded,
  includeRelations = false
): Customer => {
  return {
    id,
    applicationId,
    externalIdentifier,
    name,
    email,
    connections:
      includeRelations && connections
        ? connections.map((connection) => fromConnectionModelToConnectionUnsafe(connection))
        : undefined,
  };
};
