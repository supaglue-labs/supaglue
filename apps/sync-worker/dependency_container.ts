import { getCoreDependencyContainer } from '@supaglue/core';
import {
  ConnectionService,
  ProviderService,
  RemoteService,
  SchemaService,
  SyncConfigService,
  SyncHistoryService,
} from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import type { PrismaClient } from '@supaglue/db';
import { ApplicationService, SyncService } from '@supaglue/sync-workflows/services';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';

type DependencyContainer = {
  prisma: PrismaClient;
  temporalClient: Client;
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncConfigService: SyncConfigService;
  syncHistoryService: SyncHistoryService;
  objectSyncRunService: ObjectSyncRunService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  schemaService: SchemaService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const {
    prisma,
    connectionService,
    remoteService,
    syncHistoryService,
    providerService,
    syncConfigService,
    schemaService,
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

  const syncService = new SyncService(prisma, temporalClient, connectionService, syncConfigService);
  const objectSyncRunService = new ObjectSyncRunService(prisma, connectionService);
  const applicationService = new ApplicationService(prisma);
  const destinationService = new DestinationService(prisma);

  return {
    prisma,
    temporalClient,
    applicationService,
    connectionService,
    remoteService,
    syncService,
    objectSyncRunService,
    syncConfigService,
    syncHistoryService,
    providerService,
    destinationService,
    schemaService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
