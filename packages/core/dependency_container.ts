import prisma, { PrismaClient } from '@supaglue/db';
import { Pool } from 'pg';
import {
  ConnectionService,
  CustomerService,
  IntegrationService,
  RemoteService,
  SgUserService,
  SyncHistoryService,
} from './services';
import { CommonModelService } from './services/common_model_service';
import { DestinationService } from './services/destination_service';

export type CoreDependencyContainer = {
  pgPool: Pool;
  prisma: PrismaClient;

  // mgmt
  sgUserService: SgUserService;
  connectionService: ConnectionService;
  integrationService: IntegrationService;
  customerService: CustomerService;
  remoteService: RemoteService;
  destinationService: DestinationService;

  // crm
  commonModelService: CommonModelService;
  syncHistoryService: SyncHistoryService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

function createCoreDependencyContainer(): CoreDependencyContainer {
  const pgPool = new Pool({
    connectionString: process.env.SUPAGLUE_DATABASE_URL,
    max: 5,
  });

  // mgmt
  const sgUserService = new SgUserService();
  const integrationService = new IntegrationService(prisma);
  const connectionService = new ConnectionService(prisma, integrationService);
  const customerService = new CustomerService(prisma);
  const remoteService = new RemoteService(connectionService, integrationService);
  const destinationService = new DestinationService(prisma);

  // crm
  const commonModelService = new CommonModelService(remoteService);
  const syncHistoryService = new SyncHistoryService(prisma, connectionService);

  return {
    pgPool,
    prisma,
    // mgmt
    sgUserService,
    connectionService,
    customerService,
    integrationService,
    remoteService,
    destinationService,
    // crm
    commonModelService,
    syncHistoryService,
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
