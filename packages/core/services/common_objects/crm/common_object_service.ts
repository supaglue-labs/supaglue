import type { ConnectionSafeAny } from '@supaglue/types/connection';
import type { CRMCommonObjectType, CRMCommonObjectTypeMap } from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ConnectionService } from '../..';
import { BadRequestError } from '../../../errors';
import type { DestinationService } from '../../destination_service';
import type { RemoteService } from '../../remote_service';

export class CrmCommonObjectService {
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;
  readonly #connectionService: ConnectionService;

  public constructor(
    remoteService: RemoteService,
    destinationService: DestinationService,
    connectionService: ConnectionService
  ) {
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
    this.#connectionService = connectionService;
  }

  public async get<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    id: string
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);

    return await remoteClient.getCommonObjectRecord(objectName, id, fieldMappingConfig);
  }

  public async create<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);
    const mappedParams = { ...params, customFields: mapCustomFields(fieldMappingConfig, params.customFields) };
    const id = await remoteClient.createCommonObjectRecord(objectName, mappedParams);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await this.get(objectName, connection, id);
      await writer.upsertCommonObjectRecord<'crm', T>(connection, objectName, object);
    }

    return id;
  }

  public async update<T extends CRMCommonObjectType>(
    objectName: T,
    connection: ConnectionSafeAny,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<void> {
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connection.id);
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(connection.id, 'common', objectName);
    const mappedParams = { ...params, customFields: mapCustomFields(fieldMappingConfig, params.customFields) };
    await remoteClient.updateCommonObjectRecord(objectName, mappedParams);

    // If the associated provider has a destination, do cache invalidation
    const writer = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const object = await this.get(objectName, connection, params.id);
      await writer.upsertCommonObjectRecord<'crm', T>(connection, objectName, object);
    }
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
    const fieldMapping = fieldMappingConfig.fieldMappings.find(({ schemaField }) => schemaField === key);
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
