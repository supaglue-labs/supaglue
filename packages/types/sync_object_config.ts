import type { CommonObjectType } from './common';
import type { SyncStrategyConfig } from './sync_config';

export type CommonObjectConfig = {
  object: CommonObjectType;
  syncStrategyOverride?: SyncStrategyConfig;
};

export type StandardObjectConfig = {
  object: string;
  syncStrategyOverride?: SyncStrategyConfig;
};

export type CustomObjectConfig = {
  object: string;
  syncStrategyOverride?: SyncStrategyConfig;
};
