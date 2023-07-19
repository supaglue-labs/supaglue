import type { PrismaClient } from '@supaglue/db';
import prisma from '@supaglue/db';
import fs from 'fs';
import { Pool } from 'pg';
import {
  ConnectionService,
  CustomerService,
  ProviderService,
  RemoteService,
  SchemaService,
  SgUserService,
  SyncConfigService,
} from './services';
import { ApplicationService } from './services/application_service';
import { CrmAssociationService } from './services/common_objects/crm/association_service';
import { CrmCommonObjectService } from './services/common_objects/crm/common_object_service';
import { CrmCustomObjectService } from './services/common_objects/crm/custom_object_service';
import { EngagementCommonObjectService } from './services/common_objects/engagement/common_object_service';
import { DestinationService } from './services/destination_service';
import { EntityService } from './services/entity_service';
import { ObjectSyncRunService } from './services/object_sync_run_service';
import { ObjectSyncService } from './services/object_sync_service';
import { SystemSettingsService } from './services/system_settings_service';
import { WebhookService } from './services/webhook_service';

export type CoreDependencyContainer = {
  pgPool: Pool;
  prisma: PrismaClient;

  systemSettingsService: SystemSettingsService;

  // mgmt
  applicationService: ApplicationService;
  sgUserService: SgUserService;
  connectionService: ConnectionService;
  providerService: ProviderService;
  syncConfigService: SyncConfigService;
  customerService: CustomerService;
  remoteService: RemoteService;
  webhookService: WebhookService;
  destinationService: DestinationService;
  schemaService: SchemaService;
  objectSyncService: ObjectSyncService;
  objectSyncRunService: ObjectSyncRunService;
  entityService: EntityService;

  crmCommonObjectService: CrmCommonObjectService;
  engagementCommonObjectService: EngagementCommonObjectService;

  crmCustomObjectService: CrmCustomObjectService;
  crmAssociationService: CrmAssociationService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

function createCoreDependencyContainer(): CoreDependencyContainer {
  const connectionString = process.env.SUPAGLUE_DATABASE_URL!;
  // parse the connectionString URL to get the ssl config from the query string
  const parsedConnectionString = new URL(connectionString);
  const caCertPath = parsedConnectionString.searchParams.get('sslcert');
  const sslMode = parsedConnectionString.searchParams.get('sslmode');
  const sslAccept = parsedConnectionString.searchParams.get('sslaccept');
  // delete from the query string so that the connectionString can be passed to the pgPool
  parsedConnectionString.searchParams.delete('sslcert');
  parsedConnectionString.searchParams.delete('sslmode');
  parsedConnectionString.searchParams.delete('sslaccept');
  const ssl =
    sslMode === 'require' || sslMode === 'prefer'
      ? {
          ca: caCertPath ? fs.readFileSync(caCertPath).toString() : undefined,
          rejectUnauthorized: sslAccept === 'strict',
        }
      : undefined;

  const pgPool = new Pool({
    connectionString: parsedConnectionString.toString(),
    max: 5,
    ssl,
  });

  const systemSettingsService = new SystemSettingsService(prisma);

  // mgmt
  const applicationService = new ApplicationService(prisma);
  const sgUserService = new SgUserService();
  const providerService = new ProviderService(prisma);
  const syncConfigService = new SyncConfigService(prisma);
  const schemaService = new SchemaService(prisma);
  const entityService = new EntityService(prisma);
  const connectionService = new ConnectionService(prisma, providerService, schemaService);
  const customerService = new CustomerService(prisma);
  const remoteService = new RemoteService(connectionService, providerService);
  const webhookService = new WebhookService({ prisma });
  const destinationService = new DestinationService(prisma);

  const crmCommonObjectService = new CrmCommonObjectService(remoteService, destinationService, connectionService);
  const engagementCommonObjectService = new EngagementCommonObjectService(remoteService, destinationService);

  const crmCustomObjectService = new CrmCustomObjectService(remoteService);
  const crmAssociationService = new CrmAssociationService(remoteService);

  const objectSyncService = new ObjectSyncService(prisma, connectionService);
  const objectSyncRunService = new ObjectSyncRunService(prisma, connectionService);

  return {
    pgPool,
    prisma,
    systemSettingsService,
    // mgmt
    applicationService,
    sgUserService,
    connectionService,
    customerService,
    providerService,
    syncConfigService,
    remoteService,
    webhookService,
    destinationService,
    schemaService,
    entityService,
    crmCommonObjectService,
    engagementCommonObjectService,
    crmCustomObjectService,
    crmAssociationService,
    objectSyncService,
    objectSyncRunService,
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
