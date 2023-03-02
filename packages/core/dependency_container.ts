import prisma, { PrismaClient } from '@supaglue/db';
import { ConnectionService, ContactService, IntegrationService, RemoteService } from './services';
import { AccountService } from './services/account_service';
import { LeadService } from './services/lead_service';
import { OpportunityService } from './services/opportunity_service';

export type CoreDependencyContainer = {
  prisma: PrismaClient;
  connectionService: ConnectionService;
  integrationService: IntegrationService;
  remoteService: RemoteService;
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
  const remoteService = new RemoteService(connectionService, integrationService);
  const accountService = new AccountService(prisma, remoteService, connectionService);
  const leadService = new LeadService(prisma, remoteService, connectionService);
  const opportunityService = new OpportunityService(prisma, remoteService, connectionService);
  const contactService = new ContactService(prisma, remoteService, connectionService);

  return {
    prisma,
    connectionService,
    integrationService,
    remoteService,
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
