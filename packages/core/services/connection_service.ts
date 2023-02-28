import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../errors';
import { fromConnectionModel } from '../mappers';
import { Connection, CRMConnection, CRMConnectionUpdateParams } from '../types';

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
        credentials: {
          ...params.credentials,
          raw: params.credentials.raw as Record<string, any>,
        },
      },
    });

    return fromConnectionModel(updatedConnection) as CRMConnection;
  }
}
