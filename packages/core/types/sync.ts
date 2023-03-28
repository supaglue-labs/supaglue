import { CommonModel } from './common';

type BaseSync = {
  id: string;
  connectionId: string;
};

export type ReverseThenForwardSync = BaseSync & {
  strategy: ReverseThenForwardSyncStrategy;
  state: ReverseThenForwardSyncState;
};

// TODO: introduce more Sync
export type Sync = ReverseThenForwardSync;

type ReverseThenForwardSyncStateCreatedStage = {
  stage: 'created';
};
type ReverseThenForwardSyncStateReverseStage = {
  stage: 'reverse';
  subStageCutoffTimestampMs: number;
  stageStatus: 'in progress' | 'done';
  subStageStatus: 'syncing objects' | 'associating objects' | 'done';
};
type ReverseThenForwardSyncStageForwardStage = {
  stage: 'forward';
  subStageStatus: 'syncing objects' | 'associating objects' | 'done';
  lastSyncedObjectTimestampMsMap: Record<CommonModel, number>;
};
export type ReverseThenForwardSyncState =
  | ReverseThenForwardSyncStateCreatedStage
  | ReverseThenForwardSyncStateReverseStage
  | ReverseThenForwardSyncStageForwardStage;

// TODO: introduce more SyncState
export type SyncState = ReverseThenForwardSyncState;

/**
 * This sync strategy will:
 * 1. Sync records in reverse chronological order, starting with the most recent record.
 *    It will do so in user-defined batches so that the user can start using the data from
 *    t=T all the back way to t=T-x1, then t=T-x2, etc. with guarantees that the data
 *    in each range (T-x1, T), (T-x2, T), etc. is complete.
 * 2. In subsequent syncs, it will sync records in forward chronological order, continuing off
 *    from the last record (by modified timestamp) synced in the previous sync.
 *
 * For example:
 *
 * It is currently April 1. The user specifies batch timestamps of [March 15, March 1]. The
 * following will happen:
 * 1. On initial sync, we will:
 *    a. sync records starting from April 1 (for all common models) in
 *       reverse chron order until March 15. We note that the greatest lastModifiedTimestamp
 *       is March 28. We will then ensure that all associations are created, and notify the user.
 *    b: sync records starting from March 15 (for all common models) in
 *       reverse chron order until March 1. We will then ensure that all associations are
 *       created, and notify the user.
 *    c: sync records starting from March 1 (for all common models) in
 *       reverse chron order until the beginning of time. We will then ensure that all
 *       associations are created, and notify the user.
 * 2. On subsequent syncs, we will sync records starting from March 28 (for all common models)
 *    in forward chron order until the end of time. We will then ensure that all associations
 *    are created, and notify the user. We keep track of the high-water mark and keep doing this.
 */
type ReverseThenForwardSyncStrategy = {
  type: 'reverse then forward';
  // These timestamps should be provided in reverse chronological order, e.g. [March 15, March 1, February 23].
  reverseSubStageCutoffTimestampMsList: number[];
};

// TODO: introduce more SyncStrategy
export type SyncStrategy = ReverseThenForwardSyncStrategy;
