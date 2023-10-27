import { NotFoundError, UnauthorizedError } from '@supaglue/core/errors';
import { cryptoHash, encrypt, generateApiKey } from '@supaglue/core/lib/crypt';
import { fromApplicationModel } from '@supaglue/core/mappers/application';
import type { PrismaClient } from '@supaglue/db';
import { Prisma } from '@supaglue/db';
import type { Application, ApplicationUpdateParams, ApplicationUpsertParams } from '@supaglue/types';
import { SUPAGLUE_MANAGED_DESTINATION } from '@supaglue/utils';

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

  public async getByIdAndOrgId(id: string, orgId: string): Promise<Application> {
    const application = await this.#prisma.application.findFirst({
      where: { id, orgId },
    });
    if (!application) {
      throw new NotFoundError(`Can't find application with id: ${id} and orgId: ${orgId}`);
    }
    return fromApplicationModel(application);
  }

  async #findByTemporaryApiKey(tempApiKey: string): Promise<Application | null> {
    const { hashed: hashedApiKey } = await cryptoHash(tempApiKey);
    const temporaryApiKey = await this.#prisma.temporaryApiKey.findFirst({
      where: {
        hashedApiKey,
      },
    });

    if (!temporaryApiKey) {
      return null;
    }

    if (temporaryApiKey.expiresAt < new Date()) {
      throw new UnauthorizedError(`Temporary API key expired`);
    }

    const application = await this.getById(temporaryApiKey.applicationId);

    return application;
  }

  public async getByApiKey(apiKey: string): Promise<Application> {
    const findByTemporaryApiKey = await this.#findByTemporaryApiKey(apiKey);
    if (findByTemporaryApiKey) {
      return findByTemporaryApiKey;
    }
    const { hashed: hashedApiKey } = await cryptoHash(apiKey);

    const application = await this.#prisma.application.findMany({
      where: {
        config: {
          path: ['apiKey'],
          equals: hashedApiKey,
        },
      },
    });

    if (!application || application.length === 0) {
      throw new UnauthorizedError(`Can't find application by api key`);
    }

    if (application.length > 1) {
      throw new Error(`Found more than one application with the same api key`);
    }

    return fromApplicationModel(application[0]);
  }

  // TODO: paginate
  public async list(orgId: string): Promise<Application[]> {
    const applications = await this.#prisma.application.findMany({ where: { orgId }, orderBy: { name: 'asc' } });
    return applications.map(fromApplicationModel);
  }

  public async upsert(createParams: ApplicationUpsertParams): Promise<Application> {
    const upsertedApplication = await this.#prisma.application.upsert({
      where: {
        orgId_name: {
          ...createParams,
        },
      },
      create: {
        ...createParams,
        config: {
          apiKey: null,
          webhook: null,
        },
      },
      update: {
        ...createParams,
      },
    });
    // Upsert Supaglue Managed Destination
    await this.#prisma.destination.upsert({
      where: {
        applicationId_name: {
          applicationId: upsertedApplication.id,
          name: SUPAGLUE_MANAGED_DESTINATION,
        },
      },
      create: {
        applicationId: upsertedApplication.id,
        name: SUPAGLUE_MANAGED_DESTINATION,
        type: 'supaglue',
        encryptedConfig: await encrypt(JSON.stringify({})),
        version: 1,
      },
      update: {},
    });
    return fromApplicationModel(upsertedApplication);
  }

  public async update(id: string, orgId: string, params: ApplicationUpdateParams): Promise<Application> {
    // TODO: check that org id matches
    const updatedApplication = await this.#prisma.application.update({
      where: { id },
      data: {
        ...params,
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

    return fromApplicationModel({
      ...updatedApplication,
      config: {
        ...application.config,
        apiKey, // return the unhashed api key upon creation
      },
    });
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

  public async createTemporaryApiKey(applicationId: string, expirySecs = 24 * 3600): Promise<string> {
    const apiKey = generateApiKey();
    const { hashed: hashedApiKey } = await cryptoHash(apiKey);
    const expiresAt = new Date(Date.now() + expirySecs * 1000);
    await this.#prisma.temporaryApiKey.create({
      data: {
        applicationId,
        expiresAt,
        hashedApiKey,
      },
    });
    return apiKey;
  }

  public async delete(id: string, orgId: string): Promise<void> {
    // Check that org matches
    try {
      await this.#prisma.application.deleteMany({ where: { id, orgId } });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new Error(`Can't delete application ${id}. There may still be connections associated.`);
      }

      throw e;
    }
  }
}
