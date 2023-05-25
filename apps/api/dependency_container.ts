import { CoreDependencyContainer, getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';
import { PassthroughService } from './services';
import { ConnectionAndSyncService } from './services/connection_and_sync_service';

const TEMPORAL_ADDRESS =
  process.env.SUPAGLUE_TEMPORAL_HOST && process.env.SUPAGLUE_TEMPORAL_PORT
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:${process.env.SUPAGLUE_TEMPORAL_PORT}`
    : process.env.SUPAGLUE_TEMPORAL_HOST
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:7233`
    : 'temporal';

type DependencyContainer = CoreDependencyContainer & {
  temporalClient: Client;
  connectionAndSyncService: ConnectionAndSyncService;
  passthroughService: PassthroughService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const coreDependencyContainer = getCoreDependencyContainer();
  const { prisma, integrationService, remoteService, connectionService, applicationService, destinationService } =
    coreDependencyContainer;

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

  const connectionAndSyncService = new ConnectionAndSyncService(
    prisma,
    temporalClient,
    integrationService,
    applicationService,
    connectionService,
    destinationService
  );

  const passthroughService = new PassthroughService(remoteService);

  return {
    ...coreDependencyContainer,
    temporalClient,
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
