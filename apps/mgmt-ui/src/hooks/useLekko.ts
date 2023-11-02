import { ClientContext, EvaluationType, useLekkoConfig } from '@lekko/react-sdk';

//
// Lekkodefaults
//

export type HomeCtaButton = {
  buttonMessage: string;
  buttonLink: string;
};

export type EntitiesWhitelist = {
  applicationIds: string[];
};

export type SchemasWhitelist = {
  applicationIds: string[];
};

export function useLekko() {
  // Lekko defaults
  let entitiesWhitelistConfig: EntitiesWhitelist = {
    applicationIds: [],
  };

  let schemasWhitelistConfig: SchemasWhitelist = {
    applicationIds: [],
  };
  return {
    entitiesWhitelistConfig: useLekkoConfig({
      namespaceName: 'mgmt-ui',
      configName: 'entities_whitelist',
      evaluationType: EvaluationType.JSON,
      context: new ClientContext(),
    }) as EntitiesWhitelist,
    schemasWhitelistConfig: useLekkoConfig({
      namespaceName: 'mgmt-ui',
      configName: 'schemas_whitelist',
      evaluationType: EvaluationType.JSON,
      context: new ClientContext(),
    }) as SchemasWhitelist,
  };
}
