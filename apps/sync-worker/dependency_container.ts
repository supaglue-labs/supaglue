import { getCoreDependencyContainer } from '@supaglue/core';
import type { ConnectionService, ProviderService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import type { EntityService } from '@supaglue/core/services/entity_service';
import type { EntitySyncRunService } from '@supaglue/core/services/entity_sync_run_service';
import type { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import type { SystemSettingsService } from '@supaglue/core/services/system_settings_service';
import type { PrismaClient } from '@supaglue/db';
import { ApplicationService, SyncService } from '@supaglue/sync-workflows/services';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';

type DependencyContainer = {
  prisma: PrismaClient;
  systemSettingsService: SystemSettingsService;
  temporalClient: Client;
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncConfigService: SyncConfigService;
  objectSyncRunService: ObjectSyncRunService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  entitySyncRunService: EntitySyncRunService;
  entityService: EntityService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const {
    prisma,
    systemSettingsService,
    connectionService,
    remoteService,
    providerService,
    syncConfigService,
    objectSyncRunService,
    entitySyncRunService,
    entityService,
  } = getCoreDependencyContainer();

  const TEMPORAL_ADDRESS =
    process.env.SUPAGLUE_TEMPORAL_HOST && process.env.SUPAGLUE_TEMPORAL_PORT
      ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:${process.env.SUPAGLUE_TEMPORAL_PORT}`
      : process.env.SUPAGLUE_TEMPORAL_HOST
      ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:7233`
      : 'temporal';

  const temporalClient = new Client({
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    connection: Connection.lazy({
      address: TEMPORAL_ADDRESS,
      tls: fs.existsSync('/etc/temporal/temporal.pem')
        ? {
            clientCertPair: {
              crt: fs.readFileSync('/etc/temporal/temporal.pem'),
              key: fs.readFileSync('/etc/temporal/temporal.key'),
            },
          }
        : undefined,
    }),
  });

  const applicationService = new ApplicationService(prisma);
  const syncService = new SyncService(prisma, temporalClient, connectionService, syncConfigService, applicationService);
  const destinationService = new DestinationService(prisma);

  return {
    prisma,
    systemSettingsService,
    temporalClient,
    applicationService,
    connectionService,
    remoteService,
    syncService,
    objectSyncRunService,
    syncConfigService,
    providerService,
    destinationService,
    entitySyncRunService,
    entityService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
