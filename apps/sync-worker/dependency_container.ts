import { getCoreDependencyContainer } from '@supaglue/core';
import { ConnectionService, IntegrationService, RemoteService, SyncHistoryService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import type { PrismaClient } from '@supaglue/db';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';
import { ApplicationService, SyncService } from './services';

type DependencyContainer = {
  prisma: PrismaClient;
  temporalClient: Client;
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const { prisma, connectionService, remoteService, syncHistoryService, integrationService } =
    getCoreDependencyContainer();

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

  const syncService = new SyncService(prisma, temporalClient, connectionService, integrationService);
  const applicationService = new ApplicationService(prisma);
  const destinationService = new DestinationService(prisma);

  return {
    prisma,
    temporalClient,
    applicationService,
    connectionService,
    remoteService,
    syncService,
    syncHistoryService,
    integrationService,
    destinationService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
