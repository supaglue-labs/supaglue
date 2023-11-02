import { getEntitiesWhitelistConfig, getSchemasWhitelistConfig } from '@/utils/lekko';
import { useLekkoConfig } from '@lekko/react-sdk';

// Hooks for using config values read from Lekko

export type EntitiesWhitelist = {
  applicationIds: string[];
};

export function useEntitiesWhitelistConfig() {
  return useLekkoConfig(getEntitiesWhitelistConfig()) as EntitiesWhitelist;
}

export type SchemasWhitelist = {
  applicationIds: string[];
};

export function useSchemasWhitelistConfig() {
  return useLekkoConfig(getSchemasWhitelistConfig()) as SchemasWhitelist;
}
