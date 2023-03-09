import { getCoreDependencyContainer } from '@supaglue/core';
import type {
  AccountService,
  ApplicationService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
  RemoteService,
  SyncHistoryService,
} from '@supaglue/core/services';
import type { PrismaClient } from '@supaglue/db';

type DependencyContainer = {
  prisma: PrismaClient;
  connectionService: ConnectionService;
  contactService: ContactService;
  remoteService: RemoteService;
  accountService: AccountService;
  leadService: LeadService;
  opportunityService: OpportunityService;
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const {
    prisma,
    connectionService,
    contactService,
    remoteService,
    accountService,
    leadService,
    opportunityService,
    syncHistoryService,
    integrationService,
    applicationService,
  } = getCoreDependencyContainer();

  return {
    prisma,
    connectionService,
    contactService,
    remoteService,
    accountService,
    leadService,
    opportunityService,
    syncHistoryService,
    integrationService,
    applicationService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
