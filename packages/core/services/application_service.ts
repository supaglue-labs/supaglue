import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
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

  public async delete(id: string): Promise<Application> {
    const deletedApplication = await this.#prisma.application.delete({
      where: { id },
    });
    return fromApplicationModel(deletedApplication);
  }
}
