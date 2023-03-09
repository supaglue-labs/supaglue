import prisma, { PrismaClient } from '@supaglue/db';
import { Pool } from 'pg';
import {
  AccountService,
  ApplicationService,
  ConnectionService,
  ContactService,
  CustomerService,
  IntegrationService,
  LeadService,
  OpportunityService,
  RemoteService,
  SyncHistoryService,
} from './services';

export type CoreDependencyContainer = {
  pgPool: Pool;
  prisma: PrismaClient;

  applicationService: ApplicationService;
  connectionService: ConnectionService;
  integrationService: IntegrationService;
  customerService: CustomerService;
  remoteService: RemoteService;

  // crm
  accountService: AccountService;
  contactService: ContactService;
  leadService: LeadService;
  opportunityService: OpportunityService;
  syncHistoryService: SyncHistoryService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

function createCoreDependencyContainer(): CoreDependencyContainer {
  const pgPool = new Pool({
    connectionString: process.env.SUPAGLUE_DATABASE_URL,
  });

  const applicationService = new ApplicationService(prisma);
  const connectionService = new ConnectionService(prisma);
  const integrationService = new IntegrationService(prisma);
  const customerService = new CustomerService(prisma);
  const remoteService = new RemoteService(connectionService, integrationService);

  // crm
  const accountService = new AccountService(pgPool, prisma, remoteService);
  const leadService = new LeadService(pgPool, prisma, remoteService);
  const opportunityService = new OpportunityService(pgPool, prisma, remoteService);
  const contactService = new ContactService(pgPool, prisma, remoteService);
  const syncHistoryService = new SyncHistoryService(prisma);

  return {
    pgPool,
    prisma,
    applicationService,
    connectionService,
    customerService,
    integrationService,
    remoteService,
    // crm
    contactService,
    accountService,
    leadService,
    opportunityService,
    syncHistoryService,
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
