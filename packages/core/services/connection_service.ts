import type { PrismaClient } from '@supaglue/db';
import type { ConnectionCredentialsDecrypted, ConnectionSafe, ConnectionUnsafe } from '@supaglue/types';
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

  public async getUnsafeById(id: string): Promise<ConnectionUnsafe> {
    const connection = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) {
      throw new NotFoundError(`Can't find connection with id: ${id}`);
    }
    return fromConnectionModelToConnectionUnsafe(connection);
  }

  public async getSafeById(id: string): Promise<ConnectionSafe> {
    const connection = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) {
      throw new NotFoundError(`Can't find connection with id: ${id}`);
    }
    return fromConnectionModelToConnectionSafe(connection);
  }

  public async getSafeByIds(ids: string[]): Promise<ConnectionSafe[]> {
    const connections = await this.#prisma.connection.findMany({
      where: { id: { in: ids } },
    });
    return connections.map(fromConnectionModelToConnectionSafe);
  }

  public async getSafeByIdAndApplicationId(id: string, applicationId: string): Promise<ConnectionSafe> {
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

  public async listSafe(applicationId: string, customerId?: string, providerName?: string): Promise<ConnectionSafe[]> {
    const integrations = await this.#integrationService.list(applicationId);
    const integrationIds = integrations.map(({ id }) => id);
    const connections = await this.#prisma.connection.findMany({
      where: { integrationId: { in: integrationIds }, customerId: customerId, providerName: providerName },
    });
    return connections.map((connection) => fromConnectionModelToConnectionSafe(connection));
  }

  public async getSafeByCustomerIdAndIntegrationId({
    customerId,
    integrationId,
  }: {
    customerId: string;
    integrationId: string;
  }): Promise<ConnectionSafe> {
    const integration = await this.#prisma.connection.findUnique({
      where: {
        customerId_integrationId: {
          customerId,
          integrationId,
        },
      },
    });
    if (!integration) {
      throw new NotFoundError(`Connection not found for customer: ${customerId} and integration: ${integrationId}`);
    }
    return fromConnectionModelToConnectionSafe(integration);
  }

  public async updateConnectionWithNewAccessToken(
    connectionId: string,
    accessToken: string,
    expiresAt: string | null
  ): Promise<ConnectionSafe> {
    // TODO: Not atomic.

    const connection = await this.#prisma.connection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    const oldCredentialsUnsafe = JSON.parse(await decrypt(connection.credentials));
    const newCredentials: ConnectionCredentialsDecrypted = {
      ...(oldCredentialsUnsafe as ConnectionCredentialsDecrypted),
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
