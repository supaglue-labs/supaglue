import { NotFoundError } from '@supaglue/core/errors';
import { fromApplicationModel } from '@supaglue/core/mappers/application';
import type { PrismaClient } from '@supaglue/db';
import type { Application } from '@supaglue/types';

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
}
