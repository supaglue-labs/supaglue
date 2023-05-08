import type { PrismaClient } from '@supaglue/db';
import type { ConnectionCredentialsDecryptedAny, ConnectionSafeAny, ConnectionUnsafe } from '@supaglue/types';
import type { CRMProviderName } from '@supaglue/types/crm';
import { NotFoundError } from '../errors';
import { decrypt, encrypt } from '../lib/crypt';
import { fromConnectionModelToConnectionSafe, fromConnectionModelToConnectionUnsafe } from '../mappers';
import { IntegrationService } from './integration_service';

export class ConnectionService {
  #prisma: PrismaClient;
  #integrationService: IntegrationService;

  constructor(prisma: PrismaClient, integrationService: IntegrationService) {
    this.#prisma = prisma;
    this.#integrationService = integrationService;
  }

  public async getUnsafeById<T extends CRMProviderName>(id: string): Promise<ConnectionUnsafe<T>> {
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
        integration: {
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
    const integrations = await this.#integrationService.list(applicationId);
    const integrationIds = integrations.map(({ id }) => id);
    const connections = await this.#prisma.connection.findMany({
      where: { integrationId: { in: integrationIds }, customerId, providerName },
    });
    return connections.map(fromConnectionModelToConnectionSafe);
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
    const connection = await this.#prisma.connection.findFirstOrThrow({
      where: {
        customerId,
        integration: {
          applicationId,
          providerName,
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

  public async getSafeByCustomerIdAndIntegrationId({
    customerId,
    integrationId,
  }: {
    customerId: string;
    integrationId: string;
  }): Promise<ConnectionSafeAny> {
    const connection = await this.#prisma.connection.findUnique({
      where: {
        customerId_integrationId: {
          customerId,
          integrationId,
        },
      },
    });
    if (!connection) {
      throw new NotFoundError(`Connection not found for customer: ${customerId} and integration: ${integrationId}`);
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
