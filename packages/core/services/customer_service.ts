import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { fromCustomerModel, fromCustomerModelExpandedUnsafe } from '../mappers/customer';
import { Customer, CustomerExpandedSafe, CustomerUpsertParams } from '../types/customer';

export class CustomerService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getById(id: string): Promise<Customer> {
    const customer = await this.#prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundError(`Can't find customer with id: ${id}`);
    }
    return fromCustomerModel(customer);
  }

  // TODO: paginate
  public async list(): Promise<Customer[]> {
    const customers = await this.#prisma.customer.findMany();
    return customers.map((customer) => fromCustomerModel(customer));
  }

  // TODO: paginate
  public async listExpandedSafe(): Promise<CustomerExpandedSafe[]> {
    const customers = await this.#prisma.customer.findMany({
      include: {
        connections: true,
      },
    });
    return customers.map((customer) => fromCustomerModelExpandedUnsafe(customer));
  }

  public async upsert(customer: CustomerUpsertParams): Promise<Customer> {
    const updatedCustomer = await this.#prisma.customer.upsert({
      where: {
        applicationId_externalIdentifier: {
          applicationId: customer.applicationId,
          externalIdentifier: customer.externalIdentifier,
        },
      }, // TODO: (SUP1-58) applicationId should come from the session for security
      create: customer,
      update: customer,
    });
    return fromCustomerModel(updatedCustomer);
  }

  public async delete(id: string): Promise<Customer> {
    const deletedCustomer = await this.#prisma.customer.delete({
      where: { id },
    });
    return fromCustomerModel(deletedCustomer);
  }
}
