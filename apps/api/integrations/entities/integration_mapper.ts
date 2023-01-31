import { Integration } from '@prisma/client';
import { SALESFORCE } from '../../constants';
import { decrypt } from '../../lib/crypt';
import { SafeIntegration, UnsafeIntegration } from './integration';

export const fromModelToSafeIntegration = (model: Integration): SafeIntegration => {
  if (model.type !== SALESFORCE) {
    throw new Error(`Found unsupported integration type: ${model.type}`);
  }
  return {
    id: model.id,
    customerId: model.customerId,
    type: SALESFORCE,
    credentials: model.credentials,
  };
};

export const fromModelToUnsafeIntegration = (model: Integration): UnsafeIntegration => {
  if (model.type !== SALESFORCE) {
    throw new Error(`Found unsupported integration type: ${model.type}`);
  }
  return {
    id: model.id,
    customerId: model.customerId,
    type: SALESFORCE,
    credentials: JSON.parse(decrypt(model.credentials)),
  };
};
