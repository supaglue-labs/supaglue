import { Prisma, type PrismaClient } from '@supaglue/db';
import type {
  ConnectionCredentialsDecryptedAny,
  ConnectionSafeAny,
  ConnectionUnsafe,
  ConnectionUnsafeAny,
  ConnectionUpdateParams,
  FieldMappingInfo,
  ObjectFieldMappingInfo,
  ObjectFieldMappingUpdateParams,
  ProviderName,
  Schema,
  SchemaMappingsConfigForObject,
  SchemaMappingsConfigObjectFieldMapping,
} from '@supaglue/types';
import type { CRMProviderName } from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ObjectType } from '@supaglue/types/object_sync';
import type { ProviderService, SchemaService } from '.';
import { BadRequestError, NotFoundError } from '../errors';
import { decrypt, encrypt } from '../lib/crypt';
import { createFieldMappingConfig } from '../lib/schema';
import { fromConnectionModelToConnectionSafe, fromConnectionModelToConnectionUnsafe } from '../mappers';

export class ConnectionService {
  #prisma: PrismaClient;
  #providerService: ProviderService;
  #schemaService: SchemaService;

  constructor(prisma: PrismaClient, providerService: ProviderService, schemaService: SchemaService) {
    this.#prisma = prisma;
    this.#providerService = providerService;
    this.#schemaService = schemaService;
  }

  public async getUnsafeById<T extends ProviderName>(id: string): Promise<ConnectionUnsafe<T>> {
    const connection = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) {
      throw new NotFoundError(`Can't find connection with id: ${id}`);
    }
    return fromConnectionModelToConnectionUnsafe<T>(connection);
  }

  public async getSafeById(id: string): Promise<ConnectionSafeAny> {
    const connection = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) {
      throw new NotFoundError(`Can't find connection with id: ${id}`);
    }
    return fromConnectionModelToConnectionSafe(connection);
  }

  public async getSafeByIds(ids: string[]): Promise<ConnectionSafeAny[]> {
    const connections = await this.#prisma.connection.findMany({
      where: { id: { in: ids } },
    });
    return connections.map(fromConnectionModelToConnectionSafe);
  }

  public async getSafeByProviderId(providerId: string): Promise<ConnectionSafeAny[]> {
    const connections = await this.#prisma.connection.findMany({
      where: { providerId },
    });
    return connections.map(fromConnectionModelToConnectionSafe);
  }

  public async getSafeByIdAndApplicationId(id: string, applicationId: string): Promise<ConnectionSafeAny> {
    const connections = await this.#prisma.connection.findMany({
      where: {
        id,
        provider: {
          applicationId,
        },
      },
    });

    if (!connections.length) {
      throw new NotFoundError(`Can't find connection with id: ${id}`);
    }

    return fromConnectionModelToConnectionSafe(connections[0]);
  }

  public async getSafeByProviderNameAndApplicationId(
    providerName: string,
    applicationId: string
  ): Promise<ConnectionSafeAny> {
    const connections = await this.#prisma.connection.findMany({
      where: {
        providerName,
        provider: {
          applicationId,
        },
      },
    });

    if (!connections.length) {
      throw new NotFoundError(`Can't find connection with provider name: ${providerName}`);
    }

    if (connections.length > 1) {
      throw new Error(`Found multiple connections with provider name: ${providerName}`);
    }

    return fromConnectionModelToConnectionSafe(connections[0]);
  }

  public async listSafe(
    applicationId: string,
    customerId?: string,
    providerName?: string
  ): Promise<ConnectionSafeAny[]> {
    const providers = await this.#providerService.list(applicationId);
    const providerIds = providers.map(({ id }) => id);
    const connections = await this.#prisma.connection.findMany({
      where: { providerId: { in: providerIds }, customerId, providerName },
    });
    return connections.map(fromConnectionModelToConnectionSafe);
  }

  public async listUnsafe(
    applicationId: string,
    customerId?: string,
    providerName?: string
  ): Promise<ConnectionUnsafeAny[]> {
    const providers = await this.#providerService.list(applicationId);
    const providerIds = providers.map(({ id }) => id);
    const connections = await this.#prisma.connection.findMany({
      where: { providerId: { in: providerIds }, customerId, providerName },
    });
    return await Promise.all(connections.map(fromConnectionModelToConnectionUnsafe));
  }

  public async listAllUnsafe<T extends CRMProviderName>({
    providerName,
    customerId,
  }: {
    providerName: T;
    customerId?: string;
  }): Promise<ConnectionUnsafe<T>[]> {
    const connections = await this.#prisma.connection.findMany({
      where: { customerId, providerName },
    });
    return await Promise.all(connections.map(fromConnectionModelToConnectionUnsafe<T>));
  }

  public async getSafeByCustomerIdAndApplicationIdAndProviderName({
    customerId,
    applicationId,
    providerName,
  }: {
    customerId: string;
    applicationId: string;
    providerName: string;
  }): Promise<ConnectionSafeAny> {
    const connection = await this.#prisma.connection.findFirst({
      where: {
        customerId,
        provider: {
          applicationId,
          name: providerName,
        },
      },
    });
    if (!connection) {
      throw new NotFoundError(
        `Connection not found for customer: ${customerId} and application: ${applicationId} and provider: ${providerName}`
      );
    }
    return fromConnectionModelToConnectionSafe(connection);
  }

  public async getSafeByCustomerIdAndProviderId({
    customerId,
    providerId,
  }: {
    customerId: string;
    providerId: string;
  }): Promise<ConnectionSafeAny> {
    const connection = await this.#prisma.connection.findUnique({
      where: {
        customerId_providerId: {
          customerId,
          providerId,
        },
      },
    });
    if (!connection) {
      throw new NotFoundError(`Connection not found for customer: ${customerId} and provider: ${providerId}`);
    }
    return fromConnectionModelToConnectionSafe(connection);
  }

  public async updateConnection(id: string, params: ConnectionUpdateParams): Promise<ConnectionSafeAny> {
    const connection = await this.#prisma.connection.update({
      where: {
        id,
      },
      data: {
        schemaMappingsConfig: params.schemaMappingsConfig === null ? Prisma.DbNull : params.schemaMappingsConfig,
      },
    });
    return fromConnectionModelToConnectionSafe(connection);
  }

  private validateObjectFieldMappingUpdateParams(params: ObjectFieldMappingUpdateParams, schema: Schema): void {
    const schemaMappingRequiredFields = schema.config.fields
      .filter(({ mappedName }) => !mappedName)
      .map(({ name }) => name);
    for (const requiredField of schemaMappingRequiredFields) {
      if (!params.fieldMappings.find(({ schemaField }) => schemaField === requiredField)) {
        throw new BadRequestError(`Field ${requiredField} is missing.`);
      }
    }
    for (const fieldMapping of params.fieldMappings) {
      const field = schema.config.fields.find(({ name }) => name === fieldMapping.schemaField);
      if (!field && !schema.config.allowAdditionalFieldMappings) {
        throw new BadRequestError(`Field ${fieldMapping.schemaField} not found in schema ${schema.id}`);
      }
      if (field?.mappedName && fieldMapping.mappedField) {
        throw new BadRequestError(
          `Field ${fieldMapping.schemaField} is already mapped to ${field.mappedName} by the schema`
        );
      }
    }
  }

  public async updateObjectFieldMapping(
    connection: ConnectionSafeAny,
    params: ObjectFieldMappingUpdateParams
  ): Promise<ObjectFieldMappingInfo> {
    const schema = await this.getSchema(connection, params.name, params.type);
    if (!schema) {
      throw new BadRequestError(
        `Schema not found for object ${params.name}. Field mappings can only be set for objects with schemas attached`
      );
    }

    const newObjectMapping: SchemaMappingsConfigForObject = {
      object: params.name,
      fieldMappings: params.fieldMappings,
    };

    // Validate
    this.validateObjectFieldMappingUpdateParams(params, schema);

    const { id, schemaMappingsConfig } = connection;
    const newSchemaMappingsConfig = {
      ...schemaMappingsConfig,
    };
    if (params.type === 'common') {
      newSchemaMappingsConfig.commonObjects = addSchemaMappingsConfigForObject(
        newSchemaMappingsConfig.commonObjects ?? [],
        newObjectMapping
      );
    } else if (params.type === 'standard') {
      newSchemaMappingsConfig.standardObjects = addSchemaMappingsConfigForObject(
        newSchemaMappingsConfig.standardObjects ?? [],
        newObjectMapping
      );
    } else {
      throw new BadRequestError(`Object mappings not supported for custom objects`);
    }
    await this.#prisma.connection.update({
      where: {
        id,
      },
      data: {
        schemaMappingsConfig: newSchemaMappingsConfig,
      },
    });
    return {
      objectName: params.name,
      objectType: params.type,
      schemaId: schema.id,
      allowAdditionalFieldMappings: schema.config.allowAdditionalFieldMappings,
      fields: getFieldMappingInfo(schema, params.fieldMappings),
    };
  }

  private async getSchema(
    connection: ConnectionSafeAny,
    objectName: string,
    objectType: ObjectType
  ): Promise<Schema | undefined> {
    const { objects } = await this.#providerService.getById(connection.providerId);
    if (!objects) {
      return;
    }
    const schemaId = objects[objectType]?.find((object) => object.name === objectName)?.schemaId;
    if (!schemaId) {
      return;
    }
    return await this.#schemaService.getById(schemaId);
  }

  public async updateConnectionWithNewTokens(
    connectionId: string,
    accessToken: string,
    refreshToken: string | undefined,
    expiresAt: string | null
  ): Promise<ConnectionSafeAny> {
    // TODO: Not atomic.

    const connection = await this.#prisma.connection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    if (connection.providerName === 'apollo') {
      throw new BadRequestError(`${connection.providerName} does not support oauth connections`);
    }

    const oldCredentialsUnsafe = JSON.parse(await decrypt(connection.credentials));
    const newCredentials: ConnectionCredentialsDecryptedAny = {
      ...(oldCredentialsUnsafe as ConnectionCredentialsDecryptedAny),
      accessToken,
      refreshToken: refreshToken ?? oldCredentialsUnsafe.refreshToken,
      expiresAt,
    } as ConnectionCredentialsDecryptedAny;

    const updatedConnection = await this.#prisma.connection.update({
      where: {
        id: connectionId,
      },
      data: {
        credentials: await encrypt(JSON.stringify(newCredentials)),
      },
    });

    return fromConnectionModelToConnectionSafe(updatedConnection);
  }

  public async getFieldMappingConfig(
    connectionId: string,
    objectType: ObjectType,
    objectName: string
  ): Promise<FieldMappingConfig> {
    const connection = await this.getSafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);
    const schemaId = provider.objects?.[objectType]?.find((o) => o.name === objectName)?.schemaId;
    const schema = schemaId ? await this.#schemaService.getById(schemaId) : undefined;
    let customerFieldMapping: SchemaMappingsConfigObjectFieldMapping[] | undefined = undefined;
    if (objectType === 'common') {
      customerFieldMapping = connection.schemaMappingsConfig?.commonObjects?.find(
        (o) => o.object === objectName
      )?.fieldMappings;
    } else if (objectType === 'standard') {
      customerFieldMapping = connection.schemaMappingsConfig?.standardObjects?.find(
        (o) => o.object === objectName
      )?.fieldMappings;
    } else {
      throw new BadRequestError("Field mappings aren't supported for custom objects");
    }
    return createFieldMappingConfig(schema?.config, customerFieldMapping);
  }
}

export const getFieldMappingInfo = (
  schema: Schema,
  fieldMappings?: SchemaMappingsConfigObjectFieldMapping[]
): FieldMappingInfo[] => {
  const out: FieldMappingInfo[] = schema.config.fields.map((field) => ({
    name: field.name,
    isAddedByCustomer: false,
    schemaMappedName: field.mappedName,
  }));

  fieldMappings?.forEach((fieldMapping) => {
    const field = out.find((field) => field.name === fieldMapping.schemaField);
    if (field && !field.schemaMappedName && fieldMapping.mappedField) {
      field.customerMappedName = fieldMapping.mappedField;
    }
    if (!field) {
      out.push({
        name: fieldMapping.schemaField,
        isAddedByCustomer: true,
        customerMappedName: fieldMapping.mappedField,
      });
    }
  });

  return out;
};

function addSchemaMappingsConfigForObject(
  existingConfigs: SchemaMappingsConfigForObject[],
  newConfig: SchemaMappingsConfigForObject
) {
  const doesObjectExist = existingConfigs.some((existingConfig) => existingConfig.object === newConfig.object);

  if (doesObjectExist) {
    return existingConfigs.map((existingConfig) =>
      existingConfig.object === newConfig.object ? newConfig : existingConfig
    );
  }

  return [...existingConfigs, newConfig];
}
