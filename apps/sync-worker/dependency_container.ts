import { getCoreDependencyContainer, PrismaClient } from '@supaglue/core';
import {
  AccountService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
} from '@supaglue/core/services';

type DependencyContainer = {
  prisma: PrismaClient;
  connectionService: ConnectionService;
  contactService: ContactService;
  integrationService: IntegrationService;
  accountService: AccountService;
  leadService: LeadService;
  opportunityService: OpportunityService;
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
  } = getCoreDependencyContainer();

  return {
    prisma,
    connectionService,
    contactService,
    integrationService,
    accountService,
    leadService,
    opportunityService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
