import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { cryptoHash, generateApiKey } from '../lib/crypt';
import { fromApplicationModel } from '../mappers';
import { Application, ApplicationCreateParams, ApplicationUpdateParams } from '../types';

export class ApplicationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getById(id: string): Promise<Application> {
    const application = await this.#prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundError(`Can't find application with id: ${id}`);
    }
    return fromApplicationModel(application);
  }

  public async getByApiKey(apiKey: string): Promise<Application> {
    const { hashed: hashedApiKey } = await cryptoHash(apiKey);

    const application = await this.#prisma.application.findMany({
      where: {
        config: {
          path: ['api_key'],
          equals: hashedApiKey,
        },
      },
    });

    if (!application || application.length === 0) {
      throw new NotFoundError(`Can't find application by api key`);
    }

    if (application.length > 1) {
      throw new Error(`Found more than one application with the same api key`);
    }

    return fromApplicationModel(application[0]);
  }

  // TODO: paginate
  public async list(): Promise<Application[]> {
    const applications = await this.#prisma.application.findMany();
    return applications.map(fromApplicationModel);
  }

  public async create(application: ApplicationCreateParams): Promise<Application> {
    const createdApplication = await this.#prisma.application.create({
      data: {
        ...application,
      },
    });
    return fromApplicationModel(createdApplication);
  }

  public async update(id: string, application: ApplicationUpdateParams): Promise<Application> {
    const updatedApplication = await this.#prisma.application.update({
      where: { id },
      data: {
        ...application,
      },
    });
    return fromApplicationModel(updatedApplication);
  }

  public async createApiKey(id: string, application: ApplicationUpdateParams): Promise<Application> {
    const apiKey = generateApiKey();
    const { hashed: hashedApiKey } = await cryptoHash(apiKey);

    const updatedApplication = await this.#prisma.application.update({
      where: { id },
      data: {
        ...application,
        config: {
          ...application.config,
          apiKey: hashedApiKey,
        },
      },
    });

    return fromApplicationModel(updatedApplication);
  }

  public async deleteApiKey(id: string, application: ApplicationUpdateParams): Promise<Application> {
    const updatedApplication = await this.#prisma.application.update({
      where: { id },
      data: {
        ...application,
        config: {
          ...application.config,
          apiKey: null,
        },
      },
    });

    return fromApplicationModel(updatedApplication);
  }

  public async delete(id: string): Promise<Application> {
    const deletedApplication = await this.#prisma.application.delete({
      where: { id },
    });
    return fromApplicationModel(deletedApplication);
  }
}
