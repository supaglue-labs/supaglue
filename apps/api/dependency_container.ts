import { CoreDependencyContainer, getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import { PassthroughService, SyncService } from './services';
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
  connectionWriterService: ConnectionWriterService;
  passthroughService: PassthroughService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const coreDependencyContainer = getCoreDependencyContainer();
  const { prisma, integrationService, remoteService, applicationService, connectionService } = coreDependencyContainer;

  const temporalClient = new Client({
    connection: Connection.lazy({
      address: TEMPORAL_ADDRESS,
    }),
  });

  const syncService = new SyncService(temporalClient, connectionService);
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
