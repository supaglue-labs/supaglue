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
import { CrmCommonObjectService } from './services/common_objects/crm/common_object_service';
import { EngagementCommonObjectService } from './services/common_objects/engagement/common_object_service';
import { DestinationService } from './services/destination_service';
import { EntityRecordService } from './services/entity_record_service';
import { EntityService } from './services/entity_service';
import { MetadataService } from './services/metadata_service';
import { ObjectRecordService } from './services/object_record_service';
import { SyncRunService } from './services/sync_run_service';
import { SyncService } from './services/sync_service';
import { SystemSettingsService } from './services/system_settings_service';
import { WebhookService } from './services/webhook_service';

export type CoreDependencyContainer = {
  pgPool: Pool;

  // Managed destination data
  managedPgPool: Pool;
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
  syncService: SyncService;
  syncRunService: SyncRunService;
  entityService: EntityService;

  crmCommonObjectService: CrmCommonObjectService;
  engagementCommonObjectService: EngagementCommonObjectService;

  metadataService: MetadataService;
  entityRecordService: EntityRecordService;
  objectRecordService: ObjectRecordService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

const getPgPool = (connectionString: string): Pool => {
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

  return new Pool({
    connectionString: parsedConnectionString.toString(),
    max: 5,
    ssl,
  });
};

function createCoreDependencyContainer(): CoreDependencyContainer {
  const pgPool = getPgPool(process.env.SUPAGLUE_DATABASE_URL!);
  const managedPgPool = getPgPool(process.env.SUPAGLUE_MANAGED_DATABASE_URL!);

  const systemSettingsService = new SystemSettingsService(prisma);

  // mgmt
  const applicationService = new ApplicationService(prisma);
  const sgUserService = new SgUserService();
  const providerService = new ProviderService(prisma);
  const syncConfigService = new SyncConfigService(prisma);
  const schemaService = new SchemaService(prisma);
  const entityService = new EntityService(prisma);
  const customerService = new CustomerService(prisma);
  const webhookService = new WebhookService({ prisma, applicationService });
  const connectionService = new ConnectionService(
    prisma,
    providerService,
    schemaService,
    entityService,
    webhookService
  );
  const remoteService = new RemoteService(connectionService, providerService);
  const destinationService = new DestinationService(prisma);

  const syncService = new SyncService(prisma, connectionService);
  const syncRunService = new SyncRunService(prisma, connectionService);

  const crmCommonObjectService = new CrmCommonObjectService(
    remoteService,
    destinationService,
    connectionService,
    syncService
  );
  const engagementCommonObjectService = new EngagementCommonObjectService(remoteService, destinationService);

  const metadataService = new MetadataService(remoteService, connectionService);

  const entityRecordService = new EntityRecordService(
    entityService,
    connectionService,
    remoteService,
    destinationService,
    syncService
  );
  const objectRecordService = new ObjectRecordService(
    connectionService,
    remoteService,
    destinationService,
    syncService
  );

  return {
    pgPool,
    managedPgPool,
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
    metadataService,
    syncService,
    syncRunService,
    entityRecordService,
    objectRecordService,
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
