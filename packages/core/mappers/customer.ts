import { Customer, CustomerModelExpanded } from '../types/customer';
import { fromConnectionModel } from './connection';

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
      includeRelations && connections ? connections.map((connection) => fromConnectionModel(connection)) : undefined,
  };
};
