import { SESv2Client } from '@aws-sdk/client-sesv2';
import type { PrismaClient } from '@supaglue/db';
import prisma from '@supaglue/db';
import type { Pool } from 'pg';
import { getPgPool } from './lib';
import {
  AssociationService,
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
import { MarketingAutomationCommonObjectService } from './services/common_objects/marketing_automation';
import { DestinationService } from './services/destination_service';
import { EntityRecordService } from './services/entity_record_service';
import { EntityService } from './services/entity_service';
import { MetadataService } from './services/metadata_service';
import { NotificationService } from './services/notification_service';
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
  /**
   * @deprecated
   */
  schemaService: SchemaService;
  syncService: SyncService;
  syncRunService: SyncRunService;
  /**
   * @deprecated
   */
  entityService: EntityService;

  crmCommonObjectService: CrmCommonObjectService;
  engagementCommonObjectService: EngagementCommonObjectService;
  enrichmentCommonObjectService: EnrichmentCommonObjectService;
  marketingAutomationCommonObjectService: MarketingAutomationCommonObjectService;

  metadataService: MetadataService;
  notificationService: NotificationService;
  /**
   * @deprecated
   */
  entityRecordService: EntityRecordService;
  objectRecordService: ObjectRecordService;
  associationService: AssociationService;
};

// global
let coreDependencyContainer: CoreDependencyContainer | undefined = undefined;

function createCoreDependencyContainer(): CoreDependencyContainer {
  const pgPool = getPgPool(process.env.SUPAGLUE_DATABASE_URL!);
  const systemSettingsService = new SystemSettingsService(prisma);

  const sesClient = new SESv2Client({
    region: 'us-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // mgmt
  const applicationService = new ApplicationService(prisma);
  const sgUserService = new SgUserService();
  const providerService = new ProviderService(prisma);
  const syncConfigService = new SyncConfigService(prisma, providerService);
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
  const engagementCommonObjectService = new EngagementCommonObjectService(
    remoteService,
    destinationService,
    syncService
  );
  const enrichmentCommonObjectService = new EnrichmentCommonObjectService(remoteService);
  const marketingAutomationCommonObjectService = new MarketingAutomationCommonObjectService(remoteService);

  const metadataService = new MetadataService(remoteService, connectionService);

  const notificationService = new NotificationService(sesClient);

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
  const associationService = new AssociationService(connectionService, remoteService);

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
    marketingAutomationCommonObjectService,
    metadataService,
    syncService,
    syncRunService,
    entityRecordService,
    objectRecordService,
    associationService,
    notificationService,
  };
}

export function getCoreDependencyContainer(): CoreDependencyContainer {
  if (!coreDependencyContainer) {
    coreDependencyContainer = createCoreDependencyContainer();
  }

  return coreDependencyContainer;
}
