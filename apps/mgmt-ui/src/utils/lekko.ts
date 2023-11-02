import { ClientContext, EvaluationType } from '@lekko/react-sdk';

// Definitions for client-side Lekko configs used

export function getEntitiesWhitelistConfig() {
  return {
    namespaceName: 'mgmt-ui',
    configName: 'entities_whitelist',
    evaluationType: EvaluationType.JSON,
    context: new ClientContext(),
  };
}

export function getSchemasWhitelistConfig() {
  return {
    namespaceName: 'mgmt-ui',
    configName: 'schemas_whitelist',
    evaluationType: EvaluationType.JSON,
    context: new ClientContext(),
  };
}

export const defaultSchemasWhitelistConfig = {
  applicationIds: [],
};

export const defaultEntitiesWhitelistConfig = {
  applicationIds: [],
};
