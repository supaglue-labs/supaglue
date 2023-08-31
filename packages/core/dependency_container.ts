import type { PrismaClient } from '@supaglue/db';
import prisma from '@supaglue/db';
import type { Pool } from 'pg';
import { getPgPool } from './lib';
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
import { EnrichmentCommonObjectService } from './services/common_objects/enrichment';
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
  enrichmentCommonObjectService: EnrichmentCommonObjectService;

  metadataService: MetadataService;
  entityRecordService: EntityRecordService;
  objectRecordService: ObjectRecordService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

function createCoreDependencyContainer(): CoreDependencyContainer {
  const pgPool = getPgPool(process.env.SUPAGLUE_DATABASE_URL!);
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
  const enrichmentCommonObjectService = new EnrichmentCommonObjectService(remoteService);

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
    enrichmentCommonObjectService,
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
