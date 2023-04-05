import { CoreDependencyContainer, getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';
import { ApplicationService, PassthroughService } from './services';
import { ConnectionAndSyncService } from './services/connection_and_sync_service';

const TEMPORAL_ADDRESS =
  process.env.SUPAGLUE_TEMPORAL_HOST && process.env.SUPAGLUE_TEMPORAL_PORT
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:${process.env.SUPAGLUE_TEMPORAL_PORT}`
    : process.env.SUPAGLUE_TEMPORAL_HOST
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:7233`
    : 'temporal';

type DependencyContainer = CoreDependencyContainer & {
  temporalClient: Client;
  applicationService: ApplicationService;
  connectionAndSyncService: ConnectionAndSyncService;
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

  const applicationService = new ApplicationService(prisma);
  const connectionAndSyncService = new ConnectionAndSyncService(
    prisma,
    temporalClient,
    integrationService,
    applicationService,
    connectionService
  );

  const passthroughService = new PassthroughService(remoteService);

  return {
    ...coreDependencyContainer,
    temporalClient,
    applicationService,
    connectionAndSyncService,
    passthroughService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
