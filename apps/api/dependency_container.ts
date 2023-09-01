import type { CoreDependencyContainer } from '@supaglue/core';
import { getCoreDependencyContainer } from '@supaglue/core';
import { Client, Connection } from '@temporalio/client';
import fs from 'fs';
import { ConnectionAndSyncService, MagicLinkService, ManagedDataService, PassthroughService } from './services';

const TEMPORAL_ADDRESS =
  process.env.SUPAGLUE_TEMPORAL_HOST && process.env.SUPAGLUE_TEMPORAL_PORT
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:${process.env.SUPAGLUE_TEMPORAL_PORT}`
    : process.env.SUPAGLUE_TEMPORAL_HOST
    ? `${process.env.SUPAGLUE_TEMPORAL_HOST}:7233`
    : 'temporal';

type DependencyContainer = CoreDependencyContainer & {
  temporalClient: Client;
  connectionAndSyncService: ConnectionAndSyncService;
  passthroughService: PassthroughService;
  magicLinkService: MagicLinkService;
  managedDataService: ManagedDataService;
};

// global
let dependencyContainer: DependencyContainer | undefined = undefined;

function createDependencyContainer(): DependencyContainer {
  const coreDependencyContainer = getCoreDependencyContainer();
  const {
    prisma,
    providerService,
    customerService,
    syncConfigService,
    remoteService,
    connectionService,
    applicationService,
    webhookService,
  } = coreDependencyContainer;

  const temporalClient = new Client({
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    connection: Connection.lazy({
      address: TEMPORAL_ADDRESS,
      tls: fs.existsSync('/etc/temporal/temporal.pem')
        ? {
            clientCertPair: {
              crt: fs.readFileSync('/etc/temporal/temporal.pem'),
              key: fs.readFileSync('/etc/temporal/temporal.key'),
            },
          }
        : undefined,
    }),
  });

  const connectionAndSyncService = new ConnectionAndSyncService(
    prisma,
    temporalClient,
    providerService,
    syncConfigService,
    applicationService,
    connectionService,
    webhookService
  );

  const passthroughService = new PassthroughService(remoteService);

  const magicLinkService = new MagicLinkService(prisma, customerService, providerService, connectionAndSyncService);

  const managedDataService = new ManagedDataService();

  return {
    ...coreDependencyContainer,
    temporalClient,
    connectionAndSyncService,
    passthroughService,
    magicLinkService,
    managedDataService,
  };
}

export function getDependencyContainer(): DependencyContainer {
  if (!dependencyContainer) {
    dependencyContainer = createDependencyContainer();
  }

  return dependencyContainer;
}
