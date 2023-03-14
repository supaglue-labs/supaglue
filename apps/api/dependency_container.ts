import { CoreDependencyContainer, getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import { PassthroughService, SyncService } from './services';
import { ConnectionWriterService } from './services/connection_writer_service';

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
  const { prisma, integrationService, remoteService, applicationService } = coreDependencyContainer;

  const temporalClient = new Client({
    connection: Connection.lazy({
      address: 'temporal',
    }),
  });

  const syncService = new SyncService(temporalClient);
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
