import type { Prisma, PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { fromConnectionModel } from '../mappers';
import type { Connection, ConnectionCredentials, CRMConnection, CRMConnectionUpdateParams } from '../types';

export class ConnectionService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getById(id: string): Promise<Connection> {
    const integration = await this.#prisma.connection.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundError(`Can't find integration with id: ${id}`);
    }
    return fromConnectionModel(integration);
  }

  // TODO: paginate
  public async list(): Promise<Connection[]> {
    const connections = await this.#prisma.connection.findMany();
    return connections.map((connection) => fromConnectionModel(connection));
  }

  public async delete(id: string): Promise<Connection> {
    const deletedConnection = await this.#prisma.connection.delete({
      where: { id },
    });
    return fromConnectionModel(deletedConnection);
  }

  public async getByCustomerIdAndIntegrationId({
    customerId,
    integrationId,
  }: {
    customerId: string;
    integrationId: string;
  }): Promise<Connection> {
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
    return fromConnectionModel(integration);
  }

  public async updateConnection(connectionId: string, params: CRMConnectionUpdateParams): Promise<CRMConnection> {
    const updatedConnection = await this.#prisma.connection.update({
      where: {
        id: connectionId,
      },
      data: {
        ...params,
        credentials: params.credentials as Prisma.InputJsonObject,
      },
    });

    return fromConnectionModel(updatedConnection) as CRMConnection;
  }

  public async updateConnectionWithNewAccessToken(
    connectionId: string,
    accessToken: string,
    expiresAt: string | null
  ): Promise<CRMConnection> {
    // TODO: Not atomic.

    const connection = await this.#prisma.connection.findUniqueOrThrow({
      where: { id: connectionId },
    });

    const updatedConnection = await this.#prisma.connection.update({
      where: {
        id: connectionId,
      },
      data: {
        credentials: {
          ...(connection.credentials as ConnectionCredentials),
          accessToken,
          expiresAt,
        } as Prisma.InputJsonObject,
      },
    });

    return fromConnectionModel(updatedConnection) as CRMConnection;
  }
}
