import { logger } from '@supaglue/core/lib/logger';
import type { ConnectionService } from '@supaglue/core/services/connection_service';
import type { NotificationService } from '@supaglue/core/services/notification_service';
import type { ObjectSync, Sync } from '@supaglue/types/sync';
import type { ApplicationService } from '../services/application_service';
import type { SyncService } from '../services/sync_service';

export type PauseSyncArgs = {
  syncId: string;
  connectionId: string;
};

export type PauseSyncResult = {
  sync: Sync;
};

export function createPauseSync(
  syncService: SyncService,
  connectionService: ConnectionService,
  notificationService: NotificationService,
  applicationService: ApplicationService
) {
  // NOTE: only support object sync
  return async function pauseSync({ connectionId, syncId }: PauseSyncArgs): Promise<PauseSyncResult> {
    const syncToPause = (await syncService.getSyncById(syncId)) as ObjectSync; // NOTE: not handling EntitySync
    const pausedSync = (await syncService.pauseSync(syncToPause)) as ObjectSync; // NOTE: not handling EntitySync
    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    if (application.email) {
      try {
        await notificationService.sendSyncPausedEmail(
          connection.customerId,
          connection.providerName,
          pausedSync.object,
          application.email
        );
      } catch (err) {
        logger.error({ err }, 'unable to send notification email');
        // fail open
      }
    }

    return {
      sync: pausedSync,
    };
  };
}
