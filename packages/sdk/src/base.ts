import { DefaultFieldMapping } from './defaultFieldMapping';
import { RetryPolicy } from './retry_policy';
import { Schema } from './schema';

export type SyncStrategy = 'full_refresh' | 'incremental';

export type BaseSyncConfigParams = {
  name: string;
  cronExpression?: string;
  destination: BaseDestination;
  strategy: SyncStrategy;
  defaultFieldMapping?: DefaultFieldMapping;
};

export class BaseSyncConfig {
  name: string;
  cronExpression?: string;
  destination: BaseDestination;
  strategy: string;
  defaultFieldMapping?: DefaultFieldMapping;

  constructor({ name, cronExpression, destination, strategy, defaultFieldMapping }: BaseSyncConfigParams) {
    this.name = name;
    this.cronExpression = cronExpression;
    this.destination = destination;
    this.strategy = strategy;
    this.defaultFieldMapping = defaultFieldMapping;
  }

  toJSON() {
    return {
      name: this.name,
      cronExpression: this.cronExpression,
      destination: this.destination.toJSON(),
      strategy: this.strategy,
      defaultFieldMapping: this.defaultFieldMapping?.toJSON(),
    };
  }
}

export type BaseDestinationParams = {
  schema: Schema;
  // TODO: This retry policy may only be relevant for call-based destinations,
  // so we may want to move this out from `BaseDestinationParams` later.
  // Also, it's not clear at what level the retry policy is configured at.
  // For example, for Postgres destination, we write records one by one.
  // Does the retry policy apply to any individual record or to some
  // larger group of records?
  retryPolicy?: RetryPolicy;
};

export class BaseDestination {
  schema: Schema;
  retryPolicy?: RetryPolicy;

  constructor({ schema, retryPolicy }: BaseDestinationParams) {
    this.schema = schema;
    this.retryPolicy = retryPolicy;
  }

  toJSON() {
    return {
      schema: this.schema.toJSON(),
      retryPolicy: this.retryPolicy?.toJSON(),
    };
  }
}
