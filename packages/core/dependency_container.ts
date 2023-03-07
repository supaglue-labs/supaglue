import prisma, { PrismaClient } from '@supaglue/db';
import {
  AccountService,
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
  prisma: PrismaClient;
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
  const connectionService = new ConnectionService(prisma);
  const integrationService = new IntegrationService(prisma);
  const customerService = new CustomerService(prisma);
  const remoteService = new RemoteService(connectionService, integrationService);

  // crm
  const accountService = new AccountService(prisma, remoteService);
  const leadService = new LeadService(prisma, remoteService);
  const opportunityService = new OpportunityService(prisma, remoteService);
  const contactService = new ContactService(prisma, remoteService);
  const syncHistoryService = new SyncHistoryService(prisma);

  return {
    prisma,
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
