import { CoreDependencyContainer, getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';
import { ApplicationService, PassthroughService, SyncService } from './services';
import { ConnectionWriterService } from './services/connection_writer_service';

const TEMPORAL_ADDRESS =
  process.env.SUPAGLUE_TEMPORAL_HOST && process.env.SUPAGLUE_TEMPORAL_PORT
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:${process.env.SUPAGLUE_TEMPORAL_PORT}`
    : process.env.SUPAGLUE_TEMPORAL_HOST
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:7233`
    : 'temporal';

type DependencyContainer = CoreDependencyContainer & {
  temporalClient: Client;
  syncService: SyncService;
  applicationService: ApplicationService;
  connectionWriterService: ConnectionWriterService;
  passthroughService: PassthroughService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const coreDependencyContainer = getCoreDependencyContainer();
  const { prisma, integrationService, remoteService, connectionService } = coreDependencyContainer;

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

  const syncService = new SyncService(prisma, temporalClient, connectionService);
  const applicationService = new ApplicationService(prisma, syncService);
  const connectionWriterService = new ConnectionWriterService(
    prisma,
    syncService,
    integrationService,
    applicationService
  );

  const passthroughService = new PassthroughService(remoteService);

  return {
    ...coreDependencyContainer,
    temporalClient,
    syncService,
    applicationService,
    connectionWriterService,
    passthroughService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
