import prisma, { PrismaClient } from '@supaglue/db';
import { ConnectionService, ContactService, CustomerService, IntegrationService, RemoteService } from './services';
import { AccountService } from './services/account_service';
import { LeadService } from './services/lead_service';
import { OpportunityService } from './services/opportunity_service';

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
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
