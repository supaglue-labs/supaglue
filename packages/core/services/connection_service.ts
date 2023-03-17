import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { decrypt, encrypt } from '../lib/crypt';
import { fromConnectionModelToConnectionSafe, fromConnectionModelToConnectionUnsafe } from '../mappers';
import type { ConnectionCredentialsDecrypted, ConnectionSafe, ConnectionUnsafe } from '../types';

export class ConnectionService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getUnsafeById(id: string): Promise<ConnectionUnsafe> {
    const integration = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundError(`Can't find integration with id: ${id}`);
    }
    return fromConnectionModelToConnectionUnsafe(integration);
  }

  public async getSafeById(id: string): Promise<ConnectionSafe> {
    const integration = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundError(`Can't find integration with id: ${id}`);
    }
    return fromConnectionModelToConnectionSafe(integration);
  }

  // TODO: paginate
  public async listUnsafe(): Promise<ConnectionUnsafe[]> {
    const connections = await this.#prisma.connection.findMany();
    return connections.map((connection) => fromConnectionModelToConnectionUnsafe(connection));
  }

  public async listSafe(): Promise<ConnectionSafe[]> {
    const connections = await this.#prisma.connection.findMany();
    return connections.map((connection) => fromConnectionModelToConnectionSafe(connection));
  }

  public async delete(id: string): Promise<ConnectionSafe> {
    const deletedConnection = await this.#prisma.connection.delete({
      where: { id },
    });
    return fromConnectionModelToConnectionSafe(deletedConnection);
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
    const oldCredentialsUnsafe = JSON.parse(decrypt(connection.credentials));
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
        credentials: encrypt(JSON.stringify(newCredentials)),
      },
    });

    return fromConnectionModelToConnectionSafe(updatedConnection);
  }
}
