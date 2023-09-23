import type { PrismaClient } from '@supaglue/db';
import type { Schema, SchemaCreateParams, SchemaUpdateParams } from '@supaglue/types';
import { NotFoundError } from '../errors';
import { fromSchemaModel, toSchemaModel } from '../mappers';

/**
 * @deprecated
 */
export class SchemaService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Schema[]> {
    const schemas = await this.#prisma.schema.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(schemas.map((schema) => fromSchemaModel(schema)));
  }

  public async getById(id: string): Promise<Schema> {
    const schema = await this.#prisma.schema.findUnique({
      where: { id },
    });
    if (!schema) {
      throw new NotFoundError(`Can't find schema with id: ${id}`);
    }
    return fromSchemaModel(schema);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<Schema> {
    const schema = await this.#prisma.schema.findUnique({
      where: { id },
    });
    if (!schema || schema.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find schema with id: ${id}`);
    }

    return fromSchemaModel(schema);
  }

  public async getByNameAndApplicationId(name: string, applicationId: string): Promise<Schema> {
    const schema = await this.#prisma.schema.findUnique({
      where: {
        applicationId_name: {
          applicationId,
          name,
        },
      },
    });
    if (!schema) {
      throw new NotFoundError(`Schema not found for name: ${name}`);
    }
    return fromSchemaModel(schema);
  }

  public async list(applicationId: string): Promise<Schema[]> {
    const schemas = await this.#prisma.schema.findMany({ where: { applicationId }, orderBy: { name: 'asc' } });
    return Promise.all(schemas.map((schema) => fromSchemaModel(schema)));
  }

  public async create(schema: SchemaCreateParams): Promise<Schema> {
    const createdSchema = await this.#prisma.schema.create({
      data: toSchemaModel(schema),
    });
    return fromSchemaModel(createdSchema);
  }

  public async update(id: string, applicationId: string, schema: SchemaUpdateParams): Promise<Schema> {
    const updatedSchema = await this.#prisma.schema.update({
      where: { id },
      data: toSchemaModel({ ...schema, applicationId }),
    });
    return fromSchemaModel(updatedSchema);
  }

  public async upsert(schema: SchemaCreateParams): Promise<Schema> {
    const upsertedSchema = await this.#prisma.schema.upsert({
      where: {
        applicationId_name: {
          applicationId: schema.applicationId,
          name: schema.name,
        },
      },
      create: toSchemaModel(schema),
      update: toSchemaModel(schema),
    });
    return fromSchemaModel(upsertedSchema);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    await this.#prisma.schema.deleteMany({
      where: { id, applicationId },
    });
  }
}
