/**
 * Tests Sync Config Service
 *
 * @group unit/services/sync_config_service
 */

import { describe, expect } from '@jest/globals';
import type { SyncConfigCreateParams } from '@supaglue/types';
import { validateSyncConfigParams } from './sync_config_service';

describe('validateSyncConfigParams', () => {
  // Define some example data for testing
  const validSyncConfig: SyncConfigCreateParams = {
    applicationId: 'app1',
    destinationId: 'dest1',
    providerId: 'prov1',
    config: {
      defaultConfig: {
        periodMs: 1000,
        strategy: 'full then incremental',
        fullSyncEveryNIncrementals: 5,
        autoStartOnConnection: true,
      },
      commonObjects: [
        {
          object: 'contact',
          syncStrategyOverride: { strategy: 'full then incremental', periodMs: 60000, fullSyncEveryNIncrementals: 2 },
        },
        { object: 'account' },
      ],
    },
  };

  it('should not throw an error for valid sync config', () => {
    expect(() => validateSyncConfigParams(validSyncConfig)).not.toThrow();
  });

  it('should throw an error for duplicate common objects', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        commonObjects: [
          { object: 'contact' },
          { object: 'contact' }, // Duplicate
        ],
      },
    };

    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow('Duplicate common objects found: contact');
  });

  it('should throw an error for duplicate standard objects', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        standardObjects: [
          { object: 'obj1' },
          { object: 'obj1' }, // Duplicate
        ],
      },
    };

    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow('Duplicate standard objects found: obj1');
  });

  it('should throw an error for duplicate entities', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        entities: [
          { entityId: 'entity1' },
          { entityId: 'entity1' }, // Duplicate
        ],
      },
    };
    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow('Duplicate entities found: entity1');
  });

  it('should throw an error if fullSyncEveryNIncrementals is less than 1', () => {
    const invalidSyncConfig = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        defaultConfig: { ...validSyncConfig.config.defaultConfig, fullSyncEveryNIncrementals: 0 },
      },
    };

    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow(
      'fullSyncEveryNIncrementals must be greater than 0'
    );
  });

  it('should throw an error if fullSyncEveryNIncrementals in objects is less than 1', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        commonObjects: [
          {
            object: 'contact',
            syncStrategyOverride: { strategy: 'full then incremental', periodMs: 60000, fullSyncEveryNIncrementals: 0 },
          }, // Invalid
        ],
      },
    };
    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow(
      'fullSyncEveryNIncrementals must be greater than 0'
    );
  });

  it('should throw an error if fullSyncEveryNIncrementals us set for full only syncs', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        defaultConfig: {
          ...validSyncConfig.config.defaultConfig,
          strategy: 'full only',
          fullSyncEveryNIncrementals: 5,
        },
      },
    };

    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow(
      'fullSyncEveryNIncrementals cannot be set for full syncs'
    );
  });

  it('should throw an error if fullSyncEveryNIncrementals in objects is less than 1', () => {
    const invalidSyncConfig: SyncConfigCreateParams = {
      ...validSyncConfig,
      config: {
        ...validSyncConfig.config,
        commonObjects: [
          {
            object: 'contact',
            syncStrategyOverride: { strategy: 'full only', periodMs: 60000, fullSyncEveryNIncrementals: 5 },
          }, // Invalid
        ],
      },
    };
    expect(() => validateSyncConfigParams(invalidSyncConfig)).toThrow(
      'fullSyncEveryNIncrementals cannot be set for full syncs'
    );
  });
});
