import type { CommonObjectType } from './common';
import type { SyncStrategyConfig } from './sync_config';

export type CommonObjectConfig = {
  object: CommonObjectType;
  syncStrategyOverride?: SyncStrategyConfig;
  // If empty or unspecified, no additional associations will be fetched other than ones required for the common model
  // Only relevant for Hubspot.
  associationsToFetch?: string[];
};

export type StandardObjectConfig = {
  object: string;
  syncStrategyOverride?: SyncStrategyConfig;
  // If empty or unspecified, no associations will be fetched.
  // Only relevant for Hubspot.
  associationsToFetch?: string[];
};

export type CustomObjectConfig = {
  object: string;
  syncStrategyOverride?: SyncStrategyConfig;
  // If empty or unspecified, no associations will be fetched.
  // Only relevant for Hubspot.
  associationsToFetch?: string[];
};
