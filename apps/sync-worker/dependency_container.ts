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
  UserService,
} from '@supaglue/core/services';
import type { PrismaClient } from '@supaglue/db';
import { SyncService } from './services/sync_service';

type DependencyContainer = {
  prisma: PrismaClient;
  connectionService: ConnectionService;
  contactService: ContactService;
  remoteService: RemoteService;
  accountService: AccountService;
  leadService: LeadService;
  userService: UserService;
  opportunityService: OpportunityService;
  syncService: SyncService;
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
    userService,
    opportunityService,
    syncHistoryService,
    integrationService,
    applicationService,
  } = getCoreDependencyContainer();

  const syncService = new SyncService(prisma);

  return {
    prisma,
    connectionService,
    contactService,
    remoteService,
    accountService,
    leadService,
    userService,
    opportunityService,
    syncService,
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
