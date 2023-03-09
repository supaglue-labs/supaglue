import { Customer, CustomerModelExpanded } from '../types/customer';
import { fromConnectionModel } from './connection';

export const fromCustomerModel = (
  { id, applicationId, connections }: CustomerModelExpanded,
  includeRelations = false
): Customer => {
  return {
    id,
    applicationId,
    connections:
      includeRelations && connections ? connections.map((connection) => fromConnectionModel(connection)) : undefined,
  };
};
