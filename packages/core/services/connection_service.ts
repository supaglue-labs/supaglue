import type { PrismaClient } from '@supaglue/db';
import type {
  ConnectionCredentialsDecryptedAny,
  ConnectionSafeAny,
  ConnectionSafeAnyWithIsSyncEnabled,
  ConnectionUnsafe,
  ConnectionUnsafeAny,
  ProviderName,
} from '@supaglue/types';
import type { CRMProviderName } from '@supaglue/types/crm';
import { ProviderService } from '.';
import { NotFoundError } from '../errors';
import { decrypt, encrypt } from '../lib/crypt';
import {
  fromConnectionModelToConnectionSafe,
  fromConnectionModelToConnectionUnsafe,
  fromConnectionModelWithSyncToConnectionSafeWithIsSyncEnabled,
} from '../mappers';

export class ConnectionService {
  #prisma: PrismaClient;
  #providerService: ProviderService;

  constructor(prisma: PrismaClient, providerService: ProviderService) {
    this.#prisma = prisma;
    this.#providerService = providerService;
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

  public async listSafeWithIsSyncEnabled(
    applicationId: string,
    customerId?: string,
    providerName?: string
  ): Promise<ConnectionSafeAnyWithIsSyncEnabled[]> {
    const providers = await this.#providerService.list(applicationId);
    const providerIds = providers.map(({ id }) => id);
    const connectionsWithSyncs = await this.#prisma.connection.findMany({
      where: { providerId: { in: providerIds }, customerId, providerName },
      include: {
        sync: {
          select: {
            id: true,
          },
        },
      },
    });
    return connectionsWithSyncs.map(fromConnectionModelWithSyncToConnectionSafeWithIsSyncEnabled);
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

  public async updateConnectionWithNewAccessToken(
    connectionId: string,
    accessToken: string,
    expiresAt: string | null
  ): Promise<ConnectionSafeAny> {
    // TODO: Not atomic.

    const connection = await this.#prisma.connection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    const oldCredentialsUnsafe = JSON.parse(await decrypt(connection.credentials));
    const newCredentials: ConnectionCredentialsDecryptedAny = {
      ...(oldCredentialsUnsafe as ConnectionCredentialsDecryptedAny),
      accessToken,
      expiresAt,
    };

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
}
