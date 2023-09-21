import type { PaginatedResult, PaginationParams } from '@supaglue/types';
import type { ConnectionSafeAny } from '@supaglue/types/connection';
import type { CRMCommonObjectType, CRMCommonObjectTypeMap, ListMember, ListMetadata } from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ConnectionService } from '../..';
import { BadRequestError } from '../../../errors';
import { remoteDuration } from '../../../lib/metrics';
import type { DestinationService } from '../../destination_service';
import type { RemoteService } from '../../remote_service';
import type { SyncService } from '../../sync_service';

export class CrmCommonObjectService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;
  readonly #connectionService: ConnectionService;
  readonly #syncService: SyncService;

  public constructor(
    remoteService: RemoteService,
    destinationService: DestinationService,
    connectionService: ConnectionService,
    syncService: SyncService
  ) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
    this.#connectionService = connectionService;
    this.#syncService = syncService;
  }

  public async get<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    id: string
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);

    const end = remoteDuration.startTimer({ operation: 'get', remote_name: providerName });
    const obj = await remoteClient.getCommonObjectRecord(objectName, id, fieldMappingConfig);
    end();

    return obj;
  }

  public async create<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);
    const mappedParams = { ...params, customFields: mapCustomFields(fieldMappingConfig, params.customFields) };

    const end = remoteDuration.startTimer({ operation: 'create', remote_name: providerName });
    const id = await remoteClient.createCommonObjectRecord(objectName, mappedParams);
    end();

    await this.#cacheInvalidateObjectRecord(connection, objectName, id);

    return id;
  }

  public async upsert<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    if (objectName !== 'account' && objectName !== 'contact') {
      throw new BadRequestError(`Upsert is not supported for ${objectName}`);
    }
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);
    const mappedRecord = {
      ...params.record,
      customFields: mapCustomFields(fieldMappingConfig, params.record.customFields),
    };

    const end = remoteDuration.startTimer({ operation: 'upsert', remote_name: providerName });
    const id = await remoteClient.upsertCommonObjectRecord(objectName, { ...params, record: mappedRecord });
    end();

    await this.#cacheInvalidateObjectRecord(connection, objectName, id);

    return id;
  }

  async #cacheInvalidateObjectRecord<T extends CRMCommonObjectType>(
    connection: ConnectionSafeAny,
    objectName: T,
    id: string
  ): Promise<void> {
    const sync = await this.#syncService.findByConnectionIdAndObjectTypeAndObject(connection.id, 'common', objectName);
    if (!sync || sync.paused) {
      return;
    }
    const [writer, destinationType] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const record = await this.get(objectName, connection, id);

      const end = remoteDuration.startTimer({ operation: 'create', remote_name: destinationType! });
      await writer.upsertCommonObjectRecord<'crm', T>(connection, objectName, record);
      end();
    }
  }

  public async update<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<void> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);
    const mappedParams = { ...params, customFields: mapCustomFields(fieldMappingConfig, params.customFields) };

    const end = remoteDuration.startTimer({ operation: 'update', remote_name: providerName });
    await remoteClient.updateCommonObjectRecord(objectName, mappedParams);
    end();

    await this.#cacheInvalidateObjectRecord(connection, objectName, params.id);
  }

  public async listLists(
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    connection: ConnectionSafeAny,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMetadata>> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);

    const end = remoteDuration.startTimer({ operation: 'listLists', remote_name: providerName });
    const response = await remoteClient.listLists(objectType, paginationParams);
    end();

    return response;
  }

  public async listListMembership(
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    listId: string,
    connection: ConnectionSafeAny,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMember> & { metadata: ListMetadata }> {
    const [remoteClient, providerName] = await this.#remoteService.getCrmRemoteClient(connection.id);

    const end = remoteDuration.startTimer({ operation: 'listListMembership', remote_name: providerName });
    const response = await remoteClient.listListMembership(objectType, listId, paginationParams);
    end();

    return response;
  }
}

const mapCustomFields = (
  fieldMappingConfig: FieldMappingConfig,
  customFields?: Record<string, any>
): Record<string, any> | undefined => {
  if (!customFields) {
    return customFields;
  }
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return customFields;
  }

  Object.entries(customFields).forEach(([key, value]) => {
    const fieldMapping = fieldMappingConfig.coreFieldMappings.find(({ schemaField }) => schemaField === key);
    if (fieldMapping) {
      if (fieldMapping.mappedField !== key && customFields[fieldMapping.mappedField]) {
        throw new BadRequestError(
          `Attempted to set same field ${fieldMapping.mappedField} twice. Note: ${key} is mapped to ${fieldMapping.mappedField} for customer.`
        );
      }
      delete customFields[key];
      customFields[fieldMapping.mappedField] = value;
    }
  });
  return customFields;
};
