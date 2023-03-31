import { getCoreDependencyContainer } from '@supaglue/core';
import {
  AccountService,
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
import { ApplicationService, SyncService } from './services';

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
  } = getCoreDependencyContainer();

  const syncService = new SyncService(prisma);
  const applicationService = new ApplicationService(prisma);

  return {
    prisma,
    applicationService,
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
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
