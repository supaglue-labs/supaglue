import type { PrismaClient } from '@supaglue/db';
import type { Entity, EntityCreateParams, EntityUpdateParams } from '@supaglue/types/entity';
import { NotFoundError } from '../errors';
import { fromEntityModel, toEntityModel } from '../mappers/entity';

export class EntityService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Entity[]> {
    const entities = await this.#prisma.entity.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(entities.map(fromEntityModel));
  }

  public async getById(id: string): Promise<Entity> {
    const entity = await this.#prisma.entity.findUnique({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundError(`Can't find entity with id: ${id}`);
    }
    return fromEntityModel(entity);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<Entity> {
    const entity = await this.#prisma.entity.findUnique({
      where: { id },
    });
    if (!entity || entity.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find entity with id: ${id}`);
    }

    return fromEntityModel(entity);
  }

  public async getByNameAndApplicationId(name: string, applicationId: string): Promise<Entity> {
    const entity = await this.#prisma.entity.findUnique({
      where: {
        applicationId_name: {
          applicationId,
          name,
        },
      },
    });
    if (!entity) {
      throw new NotFoundError(`Entity not found for name: ${name}`);
    }
    return fromEntityModel(entity);
  }

  public async list(applicationId: string): Promise<Entity[]> {
    const entitys = await this.#prisma.entity.findMany({ where: { applicationId } });
    return Promise.all(entitys.map(fromEntityModel));
  }

  public async create(entity: EntityCreateParams): Promise<Entity> {
    validateEntityName(entity.name);
    const createdEntity = await this.#prisma.entity.create({
      data: toEntityModel(entity),
    });
    return fromEntityModel(createdEntity);
  }

  public async update(id: string, applicationId: string, params: EntityUpdateParams): Promise<Entity> {
    validateEntityName(params.name);
    const updatedEntity = await this.#prisma.entity.update({
      where: { id },
      data: toEntityModel({ ...params, applicationId }),
    });
    return fromEntityModel(updatedEntity);
  }

  public async upsert(params: EntityCreateParams): Promise<Entity> {
    validateEntityName(params.name);
    const upsertedEntity = await this.#prisma.entity.upsert({
      where: {
        applicationId_name: {
          applicationId: params.applicationId,
          name: params.name,
        },
      },
      create: toEntityModel(params),
      update: toEntityModel(params),
    });
    return fromEntityModel(upsertedEntity);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    await this.#prisma.entity.deleteMany({
      where: { id, applicationId },
    });
  }
}

function validateEntityName(name: string): void {
  if (!name.match(/^[a-zA-Z0-9_]+$/)) {
    throw new Error(`Invalid entity name: ${name}; must only contain letters, numbers, and underscores.`);
  }
}
