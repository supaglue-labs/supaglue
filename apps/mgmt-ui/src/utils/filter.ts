import type { NextApiRequest } from 'next';

export type SyncFilterParams = {
  filterBy: 'customerId' | 'object' | 'objectType' | 'providerName' | 'entityId';
  value: string;
};

export const maybeAddFilter = (queryParams: URLSearchParams, req: NextApiRequest) => {
  req.query?.customer_id && queryParams.append('customer_id', req.query.customer_id as string);
  req.query?.object && queryParams.append('object', req.query.object as string);
  req.query?.entity_id && queryParams.append('entity_id', req.query.entity_id as string);
  req.query?.object_type && queryParams.append('object_type', req.query.object_type as string);
  req.query?.provider_name && queryParams.append('provider_name', req.query.provider_name as string);
};
