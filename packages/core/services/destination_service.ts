import type { PrismaClient } from '@supaglue/db';
import type {
  DestinationConfigUnsafeAny,
  DestinationCreateParamsAny,
  DestinationSafeAny,
  DestinationTestParamsAny,
  DestinationTestResult,
  DestinationUnsafe,
  DestinationUnsafeAny,
  DestinationUpdateParamsAny,
  PostgresConfigUnsafe,
} from '@supaglue/types';
import { SUPAGLUE_MANAGED_DESTINATION } from '@supaglue/utils';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import type { DestinationWriter } from '../destination_writers/base';
import { PostgresDestinationWriter } from '../destination_writers/postgres';
import { SupaglueDestinationWriter } from '../destination_writers/supaglue';
import { BadRequestError } from '../errors';
import { getSsl } from '../lib';
import { encrypt } from '../lib/crypt';
import { fromDestinationModelToSafe, fromDestinationModelToUnsafe } from '../mappers/destination';

const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

export class DestinationService {
  #prisma: PrismaClient;
  #writerCache: Record<
    string,
    {
      version: number;
      writer: DestinationWriter | null;
    }
  >;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
    this.#writerCache = {};
  }

  public async getDestinationsSafeByApplicationId(applicationId: string): Promise<DestinationSafeAny[]> {
    const models = await this.#prisma.destination.findMany({
      where: { applicationId },
    });
    return Promise.all(models.map(fromDestinationModelToSafe));
  }

  public async getDestinationUnsafeByProviderId(providerId: string): Promise<DestinationUnsafeAny | null> {
    const model = await this.#prisma.destination.findFirst({
      where: {
        syncConfigs: {
          some: {
            providerId,
          },
        },
      },
    });
    if (!model) {
      return null;
    }
    return fromDestinationModelToUnsafe(model);
  }

  public async getDestinationSafeBySyncConfigId(syncConfigId: string): Promise<DestinationSafeAny | null> {
    const model = await this.#prisma.destination.findFirst({
      where: {
        syncConfigs: {
          some: {
            id: syncConfigId,
          },
        },
      },
    });
    if (!model) {
      return null;
    }
    return fromDestinationModelToSafe(model);
  }

  public async getDestinationSafeById(id: string): Promise<DestinationSafeAny> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModelToSafe(model);
  }

  public async getDestinationUnsafeById(id: string): Promise<DestinationUnsafeAny> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModelToUnsafe(model);
  }

  public async createDestination(params: DestinationCreateParamsAny): Promise<DestinationSafeAny> {
    if (params.type === 'supaglue') {
      const model = await this.#prisma.destination.create({
        data: {
          name: SUPAGLUE_MANAGED_DESTINATION,
          applicationId: params.applicationId,
          type: params.type,
          encryptedConfig: await encrypt(JSON.stringify({})),
          version: 1,
        },
      });
      return fromDestinationModelToSafe(model);
    }
    if (!params.name) {
      throw new BadRequestError('name is required');
    }
    const model = await this.#prisma.destination.create({
      data: {
        name: params.name,
        applicationId: params.applicationId,
        type: params.type,
        encryptedConfig: await encrypt(JSON.stringify(params.config)),
        version: 1,
      },
    });
    return fromDestinationModelToSafe(model);
  }

  public async testDestination(params: DestinationTestParamsAny): Promise<DestinationTestResult> {
    if (params.type === 'supaglue') {
      return {
        success: true,
        message: null,
      };
    }
    let success = false;
    let message: string | null = null;

    if (!('id' in params)) {
      const nameAlreadyExists = await this.#prisma.destination.findUnique({
        where: {
          applicationId_name: {
            applicationId: params.applicationId,
            name: params.name,
          },
        },
      });
      if (nameAlreadyExists) {
        return {
          success,
          message: 'Destination with name already exists',
        };
      }
    }

    // TODO: Refactor this code to be cleaner to merge in credentials

    const existingDestination = 'id' in params ? await this.getDestinationUnsafeById(params.id) : null;

    switch (params.type) {
      case 'postgres':
        {
          try {
            const { sslMode: _, ...rest } = params.config;
            const pgClient = new Client({
              ...rest,
              ssl: getSsl(params.config as PostgresConfigUnsafe),
              password:
                params.config.password ??
                (existingDestination as DestinationUnsafe<'postgres'> | null)?.config.password,
              connectionTimeoutMillis: 1500,
            });
            await pgClient.connect();

            await pgClient.query(`SET statement_timeout to 1500`);
            const schemaResult = await pgClient.query(
              `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${params.config.schema}'`
            ); // Use existence of schema as a proxy for appropriate grants

            await pgClient.end();

            if (schemaResult.rowCount === 0) {
              message = 'schema does not exist';
            } else {
              success = true;
            }
          } catch (err: any) {
            ({ message } = err);
          }
        }
        break;
      default:
        throw new BadRequestError(`unknown destination type`);
    }
    return { success, message };
  }

  public async updateDestination(params: DestinationUpdateParamsAny): Promise<DestinationSafeAny> {
    if (params.type === 'supaglue') {
      throw new BadRequestError('Updating not supported for supaglue managed destination');
    }
    if (!params.name) {
      throw new BadRequestError('name is required');
    }

    const existingDestination = await this.getDestinationUnsafeById(params.id);
    const mergedConfig = mergeDestinationConfig(existingDestination, params);
    const model = await this.#prisma.destination.update({
      where: { id: params.id, version: params.version },
      data: {
        applicationId: params.applicationId,
        type: params.type,
        encryptedConfig: await encrypt(JSON.stringify(mergedConfig)),
        name: params.name,
        version: params.version + 1,
      },
    });
    return fromDestinationModelToSafe(model);
  }

  public async getWriterByProviderId(
    providerId: string
  ): Promise<[DestinationWriter | null, DestinationUnsafeAny['type'] | null]> {
    const destination = await this.getDestinationUnsafeByProviderId(providerId);
    if (!destination) {
      return [null, null];
    }

    return [this.getWriterByDestination(destination), destination.type];
  }

  public async getWriterByDestinationId(destinationId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationUnsafeById(destinationId);
    if (!destination) {
      return null;
    }

    return this.getWriterByDestination(destination);
  }

  private getWriterByDestination(destination: DestinationUnsafeAny): DestinationWriter | null {
    if (destination.id in this.#writerCache) {
      const { version, writer } = this.#writerCache[destination.id];
      if (destination.version === version) {
        return writer;
      }
    }

    const writer = this.getNewWriterByDestination(destination);
    this.#writerCache[destination.id] = {
      version: destination.version,
      writer,
    };
    return writer;
  }

  private getNewWriterByDestination(destination: DestinationUnsafeAny): DestinationWriter | null {
    switch (destination.type) {
      case 'postgres':
        return new PostgresDestinationWriter(destination);
      case 'supaglue':
        return new SupaglueDestinationWriter();
      default:
        return null;
    }
  }
}

function mergeDestinationConfig(
  existingDestination: DestinationUnsafeAny,
  params: DestinationUpdateParamsAny
): DestinationConfigUnsafeAny {
  switch (existingDestination.type) {
    case 'postgres':
      if (params.type !== 'postgres') {
        throw new BadRequestError('cannot change destination type');
      }
      return {
        ...params.config,
        password: params.config.password ?? existingDestination.config.password,
      };
    case 'supaglue':
      throw new BadRequestError('cannot update supaglue managed destination');
  }
}
