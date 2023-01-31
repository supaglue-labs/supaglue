import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '8f1f3d4d-7152-4907-9f0e-9af5740b50de';

export const getSyncId = ({ syncConfigName, customerId }: { syncConfigName: string; customerId: string }): string => {
  return uuidv5(`${customerId}:${syncConfigName}`, NAMESPACE);
};
