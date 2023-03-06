import { getCoreDependencyContainer } from '@supaglue/core';
import type {
  AccountService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
  SyncHistoryService,
} from '@supaglue/core/services';
import type { PrismaClient } from '@supaglue/db';

type DependencyContainer = {
  prisma: PrismaClient;
  connectionService: ConnectionService;
  contactService: ContactService;
  integrationService: IntegrationService;
  accountService: AccountService;
  leadService: LeadService;
  opportunityService: OpportunityService;
  syncHistoryService: SyncHistoryService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const {
    prisma,
    connectionService,
    contactService,
    integrationService,
    accountService,
    leadService,
    opportunityService,
    syncHistoryService,
  } = getCoreDependencyContainer();

  return {
    prisma,
    connectionService,
    contactService,
    integrationService,
    accountService,
    leadService,
    opportunityService,
    syncHistoryService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
