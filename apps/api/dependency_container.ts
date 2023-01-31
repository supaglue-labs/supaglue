import { PrismaClient } from '@prisma/client';
import { Client, Connection } from '@temporalio/client';
import { DeveloperConfigService } from './developer_config/services';
import { IntegrationService } from './integrations/services';
import { SyncService } from './syncs/services/sync_service';

type DependencyContainer = {
  prisma: PrismaClient;
  temporalClient: Client;
  developerConfigService: DeveloperConfigService;
  integrationService: IntegrationService;
  syncService: SyncService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const prisma = new PrismaClient();

  const temporalClient = new Client({
    // TODO: We may want to call `Connection.connect()` or
    // `connection.ensureConnected()` but those are async calls
    connection: Connection.lazy({
      address: 'temporal',
    }),
  });

  const syncService = new SyncService(prisma, temporalClient);
  const developerConfigService = new DeveloperConfigService(prisma, syncService);
  const integrationService = new IntegrationService(prisma, developerConfigService, syncService);

  return {
    prisma,
    temporalClient,
    developerConfigService,
    integrationService,
    syncService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
